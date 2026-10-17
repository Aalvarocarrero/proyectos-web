/** A single live fixed surface contracts into its measured control; no cloned card or viewport estimates. */
export type MorphRect = { left: number; top: number; width: number; height: number };
export type OrbMorphOutcome = "finished" | "reversed" | "cancelled";
export type OrbMorph = { finished: Promise<OrbMorphOutcome>; reverse: () => void; cancel: () => void; release: () => void; retire: () => void };
export const ORB_MORPH_EASING = "cubic-bezier(.22, 1, .36, 1)";
export const IDEA_ORB_MORPH_MS = 520;

export function buildOrbMorphFrames(from: MorphRect, to: MorphRect, corner = 22) {
  if (![from.left, from.top, from.width, from.height, to.left, to.top, to.width, to.height].every(Number.isFinite) || from.width <= 0 || from.height <= 0 || to.width <= 0 || to.height <= 0) return null;
  const dx = to.left + to.width / 2 - from.left - from.width / 2;
  const dy = to.top + to.height / 2 - from.top - from.height / 2;
  const endX = to.width / from.width, endY = to.height / from.height;
  const surface: Keyframe[] = [], glyph: Keyframe[] = [];
  // Matching sampled transforms keep the destination label undistorted as the surface changes aspect ratio.
  for (let step = 0; step <= 32; step++) {
    const progress = step / 32, sx = 1 + (endX - 1) * progress, sy = 1 + (endY - 1) * progress;
    const radius = corner + (Math.min(to.width, to.height) / 2 - corner) * progress;
    surface.push({ offset: progress, transform: `translate3d(${dx * progress}px, ${dy * progress}px, 0) scale(${sx}, ${sy})`, borderRadius: `${radius / sx}px / ${radius / sy}px`, opacity: 1 });
    glyph.push({ offset: progress, transform: `translate(-50%, -50%) scale(${1 / sx}, ${1 / sy})`, opacity: Math.max(0, Math.min(1, (progress - .38) / .42)) });
  }
  return { surface, glyph };
}

export function startOrbMorph(options: { source: HTMLElement; target: HTMLElement; duration: number; reducedMotion: boolean; backdrop?: HTMLElement | null }): OrbMorph {
  const { source, target } = options;
  const from = source.getBoundingClientRect(), to = target.getBoundingClientRect();
  const sourceAppearance = getComputedStyle(source), targetAppearance = getComputedStyle(target);
  const frames = buildOrbMorphFrames(from, to, parseFloat(sourceAppearance.borderTopLeftRadius) || 22);
  const animations: Animation[] = [];
  const restores: Array<() => void> = [];
  let direction: OrbMorphOutcome = "finished", released = false;
  const restore = () => {
    if (released) return;
    released = true;
    for (const animation of animations) animation.cancel();
    for (const reset of restores.reverse()) reset();
  };
  const save = (element: HTMLElement, properties: Record<string, string>) => {
    const before = Object.keys(properties).map(key => [key, element.style.getPropertyValue(key), element.style.getPropertyPriority(key)]);
    for (const [key, value] of Object.entries(properties)) element.style.setProperty(key, value);
    restores.push(() => { for (const [key, value, priority] of before) { if (value) element.style.setProperty(key, value, priority); else element.style.removeProperty(key); } });
  };
  const animate = (element: HTMLElement, keyframes: Keyframe[]) => {
    const animation = element.animate(keyframes, { duration: options.duration, easing: ORB_MORPH_EASING, fill: "both" });
    animations.push(animation);
    void animation.finished.catch(() => undefined); // A construction failure can cancel before the aggregate waiter is attached.
    return animation;
  };
  if (frames && !options.reducedMotion && typeof source.animate === "function") {
    try {
      // Freeze exactly the currently painted box, including visualViewport positioning and CSS translations.
      // Normalizing the live element avoids compounded Tailwind translate/scale values and keeps the first frame identical.
      save(source, { position: "fixed", left: `${from.left}px`, top: `${from.top}px`, right: "auto", bottom: "auto", width: `${from.width}px`, height: `${from.height}px`, "max-width": "none", "max-height": "none", margin: "0", translate: "none", scale: "none", transform: "none", "transform-origin": "50% 50%", "box-sizing": "border-box", overflow: "hidden", "will-change": "transform, border-radius" });
      animate(source, frames.surface.map(frame => {
        const progress = Number(frame.offset), sx = 1 + (to.width / from.width - 1) * progress, sy = 1 + (to.height / from.height - 1) * progress;
        const border = (parseFloat(sourceAppearance.borderTopWidth) || 1) + ((parseFloat(targetAppearance.borderTopWidth) || 1) - (parseFloat(sourceAppearance.borderTopWidth) || 1)) * progress;
        return { ...frame, borderTopWidth: `${border / sy}px`, borderBottomWidth: `${border / sy}px`, borderLeftWidth: `${border / sx}px`, borderRightWidth: `${border / sx}px`,
          // Keep local glass filtering constant. Interpolating backdrop-filter while scaling
          // changes the backdrop sampling layer; it is unnecessary for the geometric morph.
          ...(frame.offset === 0 ? { backgroundColor: sourceAppearance.backgroundColor } : {}),
          ...(frame.offset === 1 ? { backgroundColor: targetAppearance.backgroundColor, color: targetAppearance.color, borderColor: targetAppearance.borderColor } : {}),
        };
      }));
      const content = source.querySelector<HTMLElement>("[data-orb-morph-content]");
      if (content) animate(content, [{ opacity: 1, offset: 0 }, { opacity: 0, offset: .3 }, { opacity: 0, offset: 1 }]);
      const glyph = source.querySelector<HTMLElement>("[data-orb-morph-glyph]");
      if (glyph) {
        save(glyph, { width: `${to.width}px`, height: `${to.height}px`, color: targetAppearance.color, "font-size": targetAppearance.fontSize, "font-weight": targetAppearance.fontWeight, "line-height": targetAppearance.lineHeight, gap: targetAppearance.gap });
        animate(glyph, frames.glyph);
      }
      // The modal hit-area is transparent and remains unchanged until unmount.
      // Never animate a viewport-sized brightness/filter layer with a small control.
    } catch { restore(); }
  }
  const finished = animations.length && !released ? Promise.all(animations.map(animation => animation.finished)).then(() => direction, () => "cancelled" as const) : Promise.resolve("finished" as const);
  return {
    finished,
    reverse() { if (released || !animations.length || direction !== "finished") return; direction = "reversed"; try { for (const animation of animations) animation.reverse(); } catch { direction = "cancelled"; restore(); } },
    cancel() { direction = "cancelled"; restore(); },
    release: restore,
    retire() {
      // Terminal close: hide before cancelling fill-mode transforms. React/Presence may
      // retain the node briefly; restoring its expanded box must never paint again.
      source.style.setProperty("visibility", "hidden", "important");
      source.style.setProperty("pointer-events", "none", "important");
      direction = "cancelled";
      restore();
    },
  };
}
