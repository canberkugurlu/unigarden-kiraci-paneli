"use client";

import KiraciSidebar from "./KiraciSidebar";
import MobileLayout from "./MobileLayout";

interface Props {
  ad: string; soyad: string; email: string; rol: string;
  children: React.ReactNode;
}

export default function KiraciShell({ ad, soyad, email, rol, children }: Props) {
  return (
    <>
      <div className="hidden md:flex h-screen overflow-hidden bg-gray-50">
        <div className="w-64 shrink-0">
          <KiraciSidebar ad={ad} soyad={soyad} email={email} rol={rol} />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <MobileLayout ad={ad} soyad={soyad} rol={rol}>{children}</MobileLayout>
    </>
  );
}
