import type { Metadata } from "next";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { FarmDashboard } from "@/components/farm-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Finca",
  description:
    "Sistema para crear planos poligonales, distribuir potreros, lagunas y cultivos, y gestionar animales, producción e inventario aun sin conexión.",
  robots: { index: false, follow: false },
};

export default async function FarmAppPage() {
  const user = await getChatGPTUser();

  if (!user) {
    return <FarmDashboard localOnly user={{ id: "device-local", name: "Mi finca en este dispositivo", email: "Sin respaldo central" }} />;
  }

  return <FarmDashboard user={{ id: user.id, name: user.displayName, email: user.email }} />;
}
