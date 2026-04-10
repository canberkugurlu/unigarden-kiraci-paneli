export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Zap, Droplets, Flame, Wifi, AlertTriangle, CheckCircle, Info } from "lucide-react";

const AYLAR = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export default async function FaturalarPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const soz = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
    include: { konut: true },
  });

  if (!soz || soz.konut.etap !== 1) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Faturalarım</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-3">
          <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Bu özellik 1. Etap dairelere özeldir</p>
            <p className="text-sm text-blue-600 mt-1">
              Elektrik, su, doğalgaz ve internet fatura takibi yalnızca 1. Etap kiracıları için geçerlidir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const faturalar = await prisma.etapFatura.findMany({
    where: { konutId: soz.konutId },
    orderBy: [{ yil: "desc" }, { ay: "desc" }],
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(n);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Faturalarım</h1>
        <p className="text-sm text-gray-500 mt-1">
          {soz.konut.daireNo} · Brüt Kira: <span className="font-semibold text-emerald-600">{fmt(soz.aylikKira)}</span>
          <span className="ml-2 text-gray-400">(1.150 ₺ fatura kotası dahil)</span>
        </p>
      </div>

      {/* Açıklama */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Aylık elektrik + su + doğalgaz + internet toplamı <strong>1.150 ₺</strong>yi aşarsa, fark "Kota Ödemesi" olarak kira borcunuza eklenir.
        </p>
      </div>

      {faturalar.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
          Henüz fatura kaydı bulunmamaktadır.
        </div>
      ) : (
        <div className="space-y-4">
          {faturalar.map((f) => {
            const toplam = f.elektrik + f.su + f.dogalgaz + f.internet;
            const kota = Math.max(0, toplam - f.kotaEsigi);
            return (
              <div key={f.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${kota > 0 ? "border-red-200" : "border-gray-100"}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h2 className="font-semibold text-gray-800">{AYLAR[f.ay]} {f.yil}</h2>
                  {kota > 0 ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      <AlertTriangle size={14} />
                      {fmt(kota)} Kota Ödemesi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <CheckCircle size={14} />
                      Kota dahilinde
                    </span>
                  )}
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                      { label: "Elektrik", value: f.elektrik, icon: Zap, color: "bg-yellow-50 text-yellow-500" },
                      { label: "Su", value: f.su, icon: Droplets, color: "bg-blue-50 text-blue-500" },
                      { label: "Doğalgaz", value: f.dogalgaz, icon: Flame, color: "bg-orange-50 text-orange-500" },
                      { label: "İnternet", value: f.internet, icon: Wifi, color: "bg-purple-50 text-purple-500" },
                    ]).map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="text-center">
                        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon size={18} />
                        </div>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{fmt(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <span className="text-sm text-gray-500">Toplam: </span>
                      <span className="font-bold text-gray-800">{fmt(toplam)}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {fmt(f.kotaEsigi)} eşik</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Bu ay ödenecek toplam</p>
                      <p className="font-bold text-gray-800">{fmt(soz.aylikKira + kota)}</p>
                    </div>
                  </div>

                  {f.aciklama && (
                    <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{f.aciklama}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
