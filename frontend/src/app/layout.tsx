import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appointment Management",
  description: "Sistema de gestión de citas de entrega",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
