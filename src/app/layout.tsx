import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Amin Daftar",
  description: "Oldi-berdi daftari",
  applicationName: "Al Amin Daftar",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#18181b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
