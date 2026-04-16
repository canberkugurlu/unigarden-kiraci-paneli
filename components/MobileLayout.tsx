"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, FileText, CreditCard, Zap, Wrench, Megaphone,
  LogOut, Menu, X, ArrowLeft, User,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const ALL_ITEMS_DEF = [
  { href: "/dashboard",           label: "Dashboard",       icon: LayoutDashboard, color: "bg-emerald-500", textColor: "text-emerald-600", minRol: "Potansiyel" },
  { href: "/dashboard/sozlesme",  label: "Sözleşmem",       icon: FileText,        color: "bg-blue-500",    textColor: "text-blue-600",    minRol: "Potansiyel" },
  { href: "/dashboard/bakim",     label: "Bakım Bildirimi", icon: Wrench,          color: "bg-orange-500",  textColor: "text-orange-600",  minRol: "Pasif" },
  { href: "/dashboard/odemeler",  label: "Ödemelerim",      icon: CreditCard,      color: "bg-green-500",   textColor: "text-green-600",   minRol: "Aktif" },
  { href: "/dashboard/faturalar", label: "Faturalarım",     icon: Zap,             color: "bg-yellow-500",  textColor: "text-yellow-600",  minRol: "Aktif" },
  { href: "/dashboard/duyurular", label: "Duyurular",       icon: Megaphone,       color: "bg-red-500",     textColor: "text-red-600",     minRol: "Aktif" },
];

const ROL_SIRASI = ["Potansiyel", "Pasif", "Aktif"];

export default function MobileLayout({ ad, soyad, rol = "Aktif", children }: { ad: string; soyad: string; rol?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAcik, setMenuAcik] = useState(false);
  const [drawerAcik, setDrawerAcik] = useState(false);

  const rolIdx = ROL_SIRASI.indexOf(rol);
  const ALL_ITEMS = ALL_ITEMS_DEF.filter(item => ROL_SIRASI.indexOf(item.minRol) <= rolIdx);
  const BOTTOM_ITEMS = ALL_ITEMS.slice(0, 4);

  const aktifItem = ALL_ITEMS.find(i => i.href === pathname);
  const baslik = aktifItem?.label ?? "Kiracı Paneli";
  const isRoot = pathname === "/dashboard";

  const cikisYap = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/giris");
  };

  const initial = (ad?.[0] ?? "") + (soyad?.[0] ?? "");

  return (
    <div className="md:hidden flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 pt-[env(safe-area-inset-top)] shrink-0 shadow-md">
        <div className="flex items-center gap-2 h-14">
          <button onClick={() => setDrawerAcik(true)} className="p-2 rounded-full hover:bg-white/10 active:bg-white/20"><Menu size={22} /></button>
          {!isRoot ? (
            <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0"><span className="text-[11px] font-bold">{initial || "UG"}</span></div>
          )}
          <div className="flex-1 min-w-0 px-1">
            <h1 className="font-semibold text-base truncate leading-tight">{baslik}</h1>
            {isRoot && <p className="text-[11px] text-emerald-100 leading-tight">{ad} {soyad}</p>}
          </div>
          <ThemeToggle className="!text-white hover:!bg-white/10" />
          <button onClick={cikisYap} className="p-2 rounded-full hover:bg-white/10" title="Çıkış"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 pb-24"><div className="p-4">{children}</div></main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon, textColor }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${active ? textColor + " font-semibold" : "text-gray-500"}`}>
                <span className={`transition-transform ${active ? "scale-110" : ""}`}><Icon size={20} /></span>
                <span className="leading-tight text-center px-1 truncate max-w-full">{label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMenuAcik(true)} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${menuAcik ? "text-emerald-600 font-semibold" : "text-gray-500"}`}>
            <Menu size={20} /><span className="leading-tight">Daha Fazla</span>
          </button>
        </div>
      </nav>

      {menuAcik && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setMenuAcik(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-t-3xl shadow-2xl pb-[env(safe-area-inset-bottom)] animate-slide-up">
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <h3 className="font-semibold text-gray-800 text-sm mt-3">Tüm Menü</h3>
              <button onClick={() => setMenuAcik(false)} className="p-1.5 rounded-full hover:bg-gray-100 -mr-1"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 pt-2">
              {ALL_ITEMS.map(({ href, label, icon: Icon, color }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMenuAcik(false)} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${active ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                    <span className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center text-white shadow-sm`}><Icon size={20} /></span>
                    <span className="text-[11px] text-gray-700 text-center leading-tight line-clamp-2">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {drawerAcik && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerAcik(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside onClick={(e) => e.stopPropagation()} className="relative w-72 max-w-[85%] h-full bg-gray-900 text-white flex flex-col shadow-2xl animate-slide-right">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><User size={18} /></div>
                  <div><p className="font-semibold text-sm">{ad} {soyad}</p><p className="text-[11px] text-emerald-100">Kiracı</p></div>
                </div>
                <button onClick={() => setDrawerAcik(false)} className="p-1.5 rounded-full hover:bg-white/10"><X size={18} /></button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {ALL_ITEMS.map(({ href, label, icon: Icon, color }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setDrawerAcik(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                    <span className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white shadow-sm shrink-0`}><Icon size={16} /></span>
                    <span className="flex-1">{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-gray-700/60 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
              <button onClick={cikisYap} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400"><LogOut size={16} />Çıkış Yap</button>
              <p className="text-[10px] text-gray-500 mt-2 px-3">v1.0.0 &copy; {new Date().getFullYear()} Unigarden</p>
            </div>
          </aside>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up    { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slide-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-up    { animation: slide-up    220ms ease-out; }
        .animate-slide-right { animation: slide-right 240ms ease-out; }
      `}</style>
    </div>
  );
}
