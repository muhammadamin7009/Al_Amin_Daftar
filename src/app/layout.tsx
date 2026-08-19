import type { Metadata, Viewport } from "next";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Amin Daftar",
  description: "Oldi-berdi daftari",
  applicationName: "Al Amin Daftar",
  appleWebApp: {
    capable: true,
    title: "Daftar",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16181a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className="h-full">
      <body className="min-h-full antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
