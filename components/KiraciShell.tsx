"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import KiraciSidebar from "./KiraciSidebar";

interface Props {
  ad: string; soyad: string; email: string;
  children: React.ReactNode;
}

export default function KiraciShell({ ad, soyad, email, children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 md:relative md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <KiraciSidebar ad={ad} soyad={soyad} email={email} onClose={() => setOpen(false)} />
      </div>

      {/* İçerik */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobil üst bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {ad[0]}{soyad[0]}
            </div>
            <span className="font-semibold text-gray-800 text-sm">{ad} {soyad}</span>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
