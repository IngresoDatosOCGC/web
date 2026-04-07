"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import HeaderMiembros from "./HeaderMiembros";
import FooterMiembros from "./FooterMiembros";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMembersArea = pathname.startsWith("/miembros");

  return (
    <>
      {isMembersArea ? <HeaderMiembros /> : <Header />}
      {children}
      {isMembersArea ? <FooterMiembros /> : <Footer />}
    </>
  );
}
