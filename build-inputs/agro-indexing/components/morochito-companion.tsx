"use client";

import { useEffect, useRef, useState } from "react";
import { SiteImage as Image } from "@/components/site-image";

export function MorochitoCompanion() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const canShow = matchMedia("(min-width: 1200px) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
    requestAnimationFrame(() => setVisible(canShow));
  }, []);
  useEffect(() => {
    const node = ref.current;
    if (!node || !visible) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / innerWidth - 0.5) * 12;
        const y = (event.clientY / innerHeight - 0.5) * 8;
        node.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${-y}deg) translate3d(${x * .5}px, ${y * .4}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); };
  }, [visible]);
  if (!visible) return null;
  return <div ref={ref} className="morochito-companion" aria-hidden="true"><Image src="/morochito.webp" alt="" width={150} height={180} sizes="150px" /><span>¿Qué necesitas del campo?</span></div>;
}
