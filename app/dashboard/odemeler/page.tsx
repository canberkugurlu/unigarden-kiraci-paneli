export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditCard, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const TIP_RENK: Record<string, string> = {
  Kira: "bg-emerald-100 text-emerald-700",
  Depozito: "bg-blue-100 text-blue-700",
  "Gecikme Faizi": "bg-red-100 text-red-700",
  Diger: "bg-gray-100 text-gray-600",
};

export default async function OdemelerPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const sozlesmeler = await prisma.sozlesme.findMany({ where: { ogrenciId: session.id } });
  const ids = sozlesmeler.map(s => s.id);

  const odemeler = await prisma.odeme.findMany({
    where: { sozlesmeId: { in: ids } },
    include: { sozlesme: { select: { sozlesmeNo: true } } },
    orderBy: { odenmeTarihi: "desc" },
  });

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
  const fmtT = (d: string | Date) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const toplam = odemeler.reduce((s, o) => s + o.tutar, 0);
  const kiraToplamı = odemeler.filter(o => o.tip === "Kira").reduce((s, o) => s + o.tutar, 0);

  // Group by year-month
  const grouped: Record<string, typeof odemeler> = {};
  for (const o of odemeler) {
    const key = format(new Date(o.odenmeTarihi), "MMMM yyyy", { locale: tr });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(o);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Ödemelerim</h1>

      {/* Özet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <span className="text-sm text-gray-500">Toplam Ödenen</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{fmt(toplam)}</p>
          <p className="text-xs text-gray-400 mt-1">{odemeler.length} işlem</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-blue-600" />
            <span className="text-sm text-gray-500">Kira Toplamı</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{fmt(kiraToplamı)}</p>
          <p className="text-xs text-gray-400 mt-1">{odemeler.filter(o => o.tip === "Kira").length} kira ödemesi</p>
        </div>
      </div>

      {/* Ödeme Listesi */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([ay, list]) => (
            <div key={ay} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-600 capitalize">{ay}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {list.map(o => (
                  <div key={o.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CreditCard size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIP_RENK[o.tip] ?? "bg-gray-100 text-gray-600"}`}>{o.tip}</span>
                          <span className="text-xs text-gray-400 font-mono">{o.sozlesme.sozlesmeNo}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtT(o.odenmeTarihi)}{o.aciklama ? ` · ${o.aciklama}` : ""}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-600">{fmt(o.tutar)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
          <p>Henüz ödeme kaydı yok</p>
        </div>
      )}
    </div>
  );
}
