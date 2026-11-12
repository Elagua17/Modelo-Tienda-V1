import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SecurityNotificationBanner } from "@/components/layout/SecurityNotificationBanner";
import { CartDrawer } from "@/components/store/CartDrawer";

export const metadata: Metadata = {
  title: "Aqua-Pure | Químicos Premium & Tecnología para Piscinas",
  description:
    "E-commerce de alto rendimiento para productos de piscina. Cloro puro, alguicidas de choque, clarificadores y robots limpiafondos con checkout seguro vía WhatsApp y arquitectura frontend protegida.",
  keywords: [
    "químicos piscina",
    "cloro pastillas",
    "alguicida",
    "clarificador piscina",
    "robots limpiafondos",
    "ph piscina",
    "mantenimiento piscinas",
  ],
  authors: [{ name: "Aqua-Pure Pools Architecture" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
        <SecurityNotificationBanner />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
