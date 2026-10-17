export type SocialRect = { left: number; top: number; right: number; bottom: number };
export type SocialViewport = { left: number; top: number; width: number; height: number };

/** Position the social control, never the page's primary actions. All coordinates are layout-viewport pixels. */
export function chooseSocialPosition(options: {
  viewport: SocialViewport;
  button: { width: number; height: number };
  panel?: { width: number; height: number };
  obstacles: SocialRect[];
  previous?: {left:number;top:number};
  insets?: { top?: number; right?: number; bottom?: number; left?: number };
}) {
  const { viewport, button, panel, obstacles } = options;
  const inset = options.insets ?? {};
  const left = viewport.left + Math.max(12, inset.left ?? 0);
  const right = viewport.left + viewport.width - Math.max(12, inset.right ?? 0);
  const top = viewport.top + Math.max(12, inset.top ?? 0);
  const bottom = viewport.top + viewport.height - Math.max(12, inset.bottom ?? 0);
  const width = Math.max(0, right - left), height = Math.max(0, bottom - top);
  const gap = 10, clearance = 10;
  const side = width >= button.width + gap + 160 ? "left" as const : "top" as const;
  const panelWidth = Math.max(0, Math.min(panel?.width ?? 224, side === "left" ? width - button.width - gap : width));
  const combinedWidth = panel ? side === "left" ? button.width + gap + panelWidth : Math.max(button.width, panelWidth) : button.width;
  const combinedLeft = right - combinedWidth;
  const intervals = obstacles
    .filter(rect => rect.right + clearance > combinedLeft && rect.left - clearance < right && rect.bottom + clearance > top && rect.top - clearance < bottom)
    .map(rect => ({ top: Math.max(top, rect.top - clearance), bottom: Math.min(bottom, rect.bottom + clearance) }))
    .filter(rect => rect.bottom > rect.top)
    .sort((a, b) => a.top - b.top);
  const free: Array<{ top: number; bottom: number }> = [];
  let cursor = top;
  for (const interval of intervals) {
    if (interval.top > cursor) free.push({ top: cursor, bottom: interval.top });
    cursor = Math.max(cursor, interval.bottom);
  }
  if (cursor < bottom) free.push({ top: cursor, bottom });
  const panelExtra = panel && side === "top" ? button.height + gap : 0;
  const preferredMinimum = panel ? Math.max(button.height, panelExtra + Math.min(120, panel.height)) : button.height;
  const absoluteMinimum = panel ? Math.max(button.height, panelExtra + 72) : button.height;
  // Prefer the lowest useful interval; scroll a shorter panel internally when space is limited.
  const selected = [...free].reverse().find(rect => rect.bottom - rect.top >= preferredMinimum)
    ?? [...free].sort((a, b) => (b.bottom - b.top) - (a.bottom - a.top)).find(rect => rect.bottom - rect.top >= absoluteMinimum);
  const hidden = !selected || width < button.width || height < button.height;
  const previous=options.previous;
  const stableInterval=!panel&&previous?free.find(rect=>previous.top>=rect.top&&previous.top+button.height<=rect.bottom):undefined;
  const selectedBottom = stableInterval&&previous?previous.top+button.height:selected?.bottom ?? bottom;
  return {
    left: Math.round(Math.max(left, right - button.width)),
    top: Math.round(Math.max(top, selectedBottom - button.height)),
    hidden,
    panelSide: side,
    panelWidth,
    panelMaxHeight: Math.max(0, panel ? Math.min(panel.height, Math.max(0, (selected?.bottom ?? bottom) - (selected?.top ?? top) - panelExtra)) : height),
  };
}

/** Moving content is sampled after scrolling settles, not on every animation frame. */
export function createSocialLayoutScheduler(options:{measure:()=>void;setTimer:(fn:()=>void,ms:number)=>number;clearTimer:(id:number)=>void;requestFrame:(fn:()=>void)=>number;cancelFrame:(id:number)=>void}){
 let frame:number|undefined,timer:number|undefined,scrolling=false,stopped=false;
 const schedule=()=>{if(stopped||scrolling)return;if(frame!==undefined)options.cancelFrame(frame);frame=options.requestFrame(()=>{frame=undefined;if(!stopped)options.measure();});};
 const onScroll=()=>{if(stopped)return;scrolling=true;if(frame!==undefined){options.cancelFrame(frame);frame=undefined;}if(timer!==undefined)options.clearTimer(timer);timer=options.setTimer(()=>{timer=undefined;scrolling=false;schedule();},160);};
 return {schedule,onScroll,stop(){stopped=true;if(frame!==undefined)options.cancelFrame(frame);if(timer!==undefined)options.clearTimer(timer);}};
}
