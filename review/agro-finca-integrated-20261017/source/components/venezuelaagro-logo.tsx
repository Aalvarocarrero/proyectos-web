/** Shared, resolution-independent brand lockup for every screen size. */
export function VenezuelaAgroLogo({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  return <span className={`inline-flex flex-col ${tone === "dark" ? "text-[#3e2a19]" : "text-[#f3ebdd]"}`} aria-label="VenezuelaAgro">
    <span className={`font-display relative block whitespace-nowrap leading-none tracking-[-.025em] ${compact ? "text-[1rem] sm:text-xl" : "text-xl sm:text-2xl"}`} aria-hidden="true">Venezuela<span className="text-[#1e7e1a]">Agro</span>
      <svg viewBox="0 0 24 24" className={`absolute -right-0.5 text-[#1e7e1a] ${compact ? "-top-2 h-3 w-3" : "-top-3 h-4 w-4"}`} fill="currentColor"><path d="M7 18C4 9 11 3 22 2c0 12-5 18-13 17L19 6 7 18Z"/><path d="M5 16C0 13 0 8 3 4c5 4 6 8 2 12Z"/></svg>
    </span>
    <svg viewBox="0 0 240 28" className={`mt-0.5 w-full text-[#1e7e1a] ${compact ? "h-2 sm:h-3" : "h-4"}`} fill="currentColor" aria-hidden="true"><path d="M0 18C65-3 150-4 240 12C145 0 79 7 30 23Z"/><path d="M48 22C108 2 173 4 240 13C171 8 120 14 85 26Z"/><path d="M110 25C158 9 201 10 240 14C189 13 158 19 145 28Z"/></svg>
  </span>;
}
