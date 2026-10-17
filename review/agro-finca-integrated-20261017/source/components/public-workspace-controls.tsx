"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keep invitations out of focused workspaces and the isolated learning preview. */
export function PublicWorkspaceControls({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  if (pathname === "/juego-finca" || pathname.startsWith("/juego-finca/")) return null;
  return children;
}
