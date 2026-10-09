import { robotsPolicy } from "@/lib/indexing-policy";
import { SITE_ORIGIN } from "@/lib/site-identity";
import type { Metadata, Viewport } from "next";
import { InstallAppBanner } from "@/components/install-app-banner";
import { AccountServices } from "@/components/account-services";
import {SocialFloatingMenu} from "@/components/social-links";
import {OfflineNavigation} from "@/components/offline-navigation";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  robots:robotsPolicy(),
  title: {
    default: "VenezuelaAgro | Gestión de fincas y mercado agropecuario en Venezuela",
    template: "%s | VenezuelaAgro",
  },
  description:
    "VenezuelaAgro conecta productores, profesionales y empresas de Venezuela. Gestión local de fincas sin señal, mercado agropecuario y comunidad. Hecho por Parcela Los Morochos.",
  applicationName: "Venezuela Agro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Venezuela Agro",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  keywords: [
    "finca Venezuela",
    "agropecuaria Apure",
    "ganadería Venezuela",
    "Venezuela Agro",
    "comprar y vender cosechas Venezuela",
    "marketplace agropecuario",
    "gestión de fincas",
    "producción animal",
  ],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "VenezuelaAgro",
    title: "VenezuelaAgro | Raíces venezolanas. Visión internacional.",
    description: "Producción, conocimiento, mercado agropecuario y tecnología para administrar tu finca aun sin conexión.",
    images: [{ url: "/hero-apure.webp", width: 1536, height: 1024, alt: "Campo venezolano al amanecer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venezuela Agro",
    description: "Campo, familia y tecnología para el productor venezolano.",
    images: ["/hero-apure.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#211d1a",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-VE">
      <body className="min-w-0 overflow-x-clip antialiased">
        {children}
        <AccountServices />
        <InstallAppBanner />
        <SocialFloatingMenu />
        <OfflineNavigation />
        <Toaster theme="light" position="top-center" offset="6rem" mobileOffset="6rem" closeButton visibleToasts={2} />
      </body>
    </html>
  );
}
