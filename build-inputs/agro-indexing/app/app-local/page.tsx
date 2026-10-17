import type { Metadata } from "next";
import { FarmDashboard } from "@/components/farm-dashboard";
export const metadata: Metadata = { title: "Mi Finca · copia local", robots: { index: false, follow: false } };
// This offline shell deliberately never reads session headers or embeds account identity.
export default function LocalFarmPage() {
  return <FarmDashboard localOnly user={{ id: "device-local", name: "Mi finca en este dispositivo", email: "Sin respaldo central" }} />;
}
