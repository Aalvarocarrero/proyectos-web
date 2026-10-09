"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accessibility, Check } from "lucide-react";

type Prefs = { largeText: boolean; highContrast: boolean; reduceMotion: boolean };
const defaults: Prefs = { largeText: false, highContrast: false, reduceMotion: false };

export function AccessibilityMenu() {
  const [prefs, setPrefs] = useState(defaults);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("morochos-accessibility") || "null") as Prefs | null; if (saved) { apply(saved); requestAnimationFrame(() => setPrefs(saved)); } } catch { /* use defaults */ }
  }, []);
  function update(key: keyof Prefs) { const next = { ...prefs, [key]: !prefs[key] }; setPrefs(next); apply(next); try { localStorage.setItem("morochos-accessibility", JSON.stringify(next)); } catch { /* The current reading preference still applies when storage is unavailable. */ } }
  return <Popover><PopoverTrigger asChild><button type="button" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/85" aria-label="Opciones de accesibilidad"><Accessibility size={18} /></button></PopoverTrigger><PopoverContent align="end" sideOffset={8} collisionPadding={12} className="max-h-[var(--radix-popover-content-available-height)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#211d1a] p-3 text-white shadow-2xl"><p className="px-2 pb-2 text-xs font-bold tracking-wider text-white/45">LECTURA Y MOVIMIENTO</p>{[["largeText","Texto más grande"],["highContrast","Mayor contraste"],["reduceMotion","Reducir movimientos"]].map(([key,label]) => <button key={key} type="button" aria-pressed={prefs[key as keyof Prefs]} onClick={() => update(key as keyof Prefs)} className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-white/8"><span>{label}</span>{prefs[key as keyof Prefs] && <Check size={17} className="text-[#b7d79a]" />}</button>)}</PopoverContent></Popover>;
}

function apply(prefs: Prefs) { const root = document.documentElement; root.dataset.largeText = String(prefs.largeText); root.dataset.highContrast = String(prefs.highContrast); root.dataset.reduceMotion = String(prefs.reduceMotion); }
