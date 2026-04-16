export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock, Home, LogOut } from "lucide-react";
import Link from "next/link";

export default async function BekliyorPage() {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.rol === "Aktif") redirect("/dashboard");
  if (session.rol === "Pasif") redirect("/sozlesme-imza");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
          <Clock className="text-emerald-600" size={32} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merhaba, {session.ad}!</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Kaydınız alındı. Bir kiralama temsilcisi sizinle iletişime geçerek
            sözleşme sürecini başlatacaktır.
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 space-y-3 text-left">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Süreç Adımları</p>
          {[
            { done: true,  label: "Hesap oluşturuldu" },
            { done: false, label: "Kiralama temsilcisi sözleşme gönderecek" },
            { done: false, label: "Sözleşmeyi onaylayın" },
            { done: false, label: "3 taraflı onay tamamlanacak" },
            { done: false, label: "Kiracı portala tam erişim" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                step.done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {step.done ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${step.done ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link
            href="/api/auth"
            prefetch={false}
            onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            <LogOut size={15} />
            Çıkış Yap
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Home size={15} />
            Yenile
          </button>
        </div>
      </div>
    </div>
  );
}
