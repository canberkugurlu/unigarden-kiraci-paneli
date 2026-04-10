"use client";

import KiraciSidebar from "./KiraciSidebar";

interface Props {
  ad: string; soyad: string; email: string;
  children: React.ReactNode;
}

export default function KiraciShell({ ad, soyad, email, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-64 shrink-0">
        <KiraciSidebar ad={ad} soyad={soyad} email={email} />
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
