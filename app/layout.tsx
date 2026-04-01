"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeaderMiembros from "@/components/HeaderMiembros";
import FooterMiembros from "@/components/FooterMiembros";
import "../css/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMembersArea = pathname.startsWith("/miembros");

  return (
    <html lang="es">
      <head>
        <title>OCGC - Orquesta Comunitaria de Gran Canaria</title>
      </head>
      <body>
        <ClerkProvider>
          {/* Si es zona de MIEMBROS: solo ponemos el Header privado */}
          {isMembersArea ? <HeaderMiembros /> : <Header />}
          
          {children}

          {/* Si es zona de MIEMBROS: solo ponemos el Footer privado */}
          {isMembersArea ? <FooterMiembros /> : <Footer />}
        </ClerkProvider>
      </body>
    </html>
  );
}
