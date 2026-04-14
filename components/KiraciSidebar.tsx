"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, CreditCard, Wrench, Megaphone, LogOut, KeyRound, Zap } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
  { href: "/dashboard", label: "Ana Sayfa", icon: LayoutDashboard },
  { href: "/dashboard/sozlesme", label: "Sözleşmem", icon: FileText },
  { href: "/dashboard/odemeler", label: "Ödemelerim", icon: CreditCard },
  { href: "/dashboard/faturalar", label: "Faturalarım", icon: Zap },
  { href: "/dashboard/bakim", label: "Bakım Bildirimi", icon: Wrench },
  { href: "/dashboard/duyurular", label: "Duyurular", icon: Megaphone },
];

export default function KiraciSidebar({ ad, soyad, email, onClose }: { ad: string; soyad: string; email: string; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cikis = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/giris");
  };

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {ad[0]}{soyad[0]}
          </div>
          <div>
            <p className="font-semibold text-sm">{ad} {soyad}</p>
            <p className="text-xs text-gray-400 truncate max-w-[130px]">{email}</p>
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-gray-700">
        <p className="text-xs text-emerald-400 font-semibold px-3 py-1">UNIGARDEN</p>
        <p className="text-xs text-gray-500 px-3 pb-1">Kiracı Portalı</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-1">
        <Link href="/dashboard/sifre" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <KeyRound size={17} /> Şifre Değiştir
        </Link>
        <button onClick={cikis} disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-50">
          <LogOut size={17} /> {loading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
        </button>
      </div>
    </aside>
  );
}
