export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, CreditCard, Wrench, Megaphone, AlertCircle, Zap, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const [sozlesme, odemeler, talepler, duyurular, sonFatura, pendingSozlesme] = await Promise.all([
    prisma.sozlesme.findFirst({
      where: { ogrenciId: session.id, durum: "Aktif" },
      include: { konut: true },
    }),
    prisma.sozlesme.findMany({ where: { ogrenciId: session.id } }).then(async sozs => {
      const ids = sozs.map(s => s.id);
      return prisma.odeme.findMany({ where: { sozlesmeId: { in: ids } }, orderBy: { odenmeTarihi: "desc" }, take: 3 });
    }),
    prisma.bakimTalebi.findMany({ where: { ogrenciId: session.id, durum: { not: "Tamamlandi" } } }),
    prisma.duyuru.findMany({ where: { yayinda: true }, orderBy: { tarih: "desc" }, take: 3 }),
    prisma.sozlesme.findFirst({ where: { ogrenciId: session.id, durum: "Aktif" }, select: { konutId: true, aylikKira: true, konut: { select: { etap: true } } } })
      .then(async (s) => {
        if (!s || s.konut.etap !== 1) return null;
        return prisma.etapFatura.findFirst({ where: { konutId: s.konutId }, orderBy: [{ yil: "desc" }, { ay: "desc" }] });
      }),
    prisma.sozlesme.findFirst({
      where: {
        ogrenciId: session.id,
        durum: { in: ["BekleniyorImza", "ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor"] },
      },
      orderBy: { olusturmaTar: "desc" },
    }),
  ]);

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
  const fmtT = (d: string | Date) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const gunKaldi = sozlesme
    ? Math.ceil((new Date(sozlesme.bitisTarihi).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Merhaba, {session.ad} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{fmtT(new Date())}</p>
      </div>

      {/* Süreç Durumu — yalnızca aktif sözleşme yokken göster */}
      {!sozlesme && (() => {
        const d = pendingSozlesme?.durum;
        const imzaBekleniyor = d === "BekleniyorImza";
        const onayBekleniyor = d === "ImzalandiOnayBekliyor";
        const baslangicBekleniyor = d === "OnaylandiAktifBekliyor";

        const steps = [
          {
            label: "Potansiyel Kiracı",
            desc: "Kayıt oluşturuldu",
            done: !!d,
            active: !d,
          },
          {
            label: "Pasif Kiracı",
            desc: imzaBekleniyor ? "Sözleşme imzanızı bekliyor" : "Sözleşme imzalandı",
            done: onayBekleniyor || baslangicBekleniyor,
            active: imzaBekleniyor,
          },
          {
            label: "Onay Süreci",
            desc: baslangicBekleniyor ? "Tüm onaylar tamamlandı" : "3 taraflı onay bekleniyor",
            done: baslangicBekleniyor,
            active: onayBekleniyor,
          },
          {
            label: "Aktif Kiracı",
            desc: "Sözleşme başlangıç tarihinde aktif olacaksınız",
            done: false,
            active: baslangicBekleniyor,
          },
        ];

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-500" />
              <h2 className="font-semibold text-gray-800 text-sm">Kiracılık Süreci</h2>
            </div>
            <div className="flex items-start gap-0">
              {steps.map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center text-center">
                  <div className="flex items-center w-full">
                    {i > 0 && <div className={`h-0.5 flex-1 ${steps[i - 1].done ? "bg-emerald-400" : "bg-gray-200"}`} />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 ${
                      step.done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : step.active
                        ? "bg-amber-100 border-amber-400 text-amber-700"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}>
                      {step.done ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${step.done ? "bg-emerald-400" : "bg-gray-200"}`} />}
                  </div>
                  <p className={`text-xs font-semibold mt-2 ${step.active ? "text-amber-600" : step.done ? "text-emerald-600" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight px-1">{step.active || step.done ? step.desc : ""}</p>
                </div>
              ))}
            </div>
            {pendingSozlesme && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link href="/dashboard/sozlesme" className="text-xs text-emerald-600 hover:underline font-medium">
                  {imzaBekleniyor ? "→ Sözleşmeyi görüntüle ve imzala" : "→ Sözleşme durumunu görüntüle"}
                </Link>
              </div>
            )}
            {!pendingSozlesme && (
              <p className="mt-3 text-center text-xs text-gray-400">Kiralama temsilciniz sözleşmenizi hazırlayacak ve size iletecektir.</p>
            )}
          </div>
        );
      })()}

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/sozlesme" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center"><FileText size={18} className="text-emerald-600" /></div>
            <span className="text-sm text-gray-500">Sözleşmem</span>
          </div>
          {sozlesme ? (
            <>
              <p className="text-lg font-bold text-gray-800">{fmt(sozlesme.aylikKira)}<span className="text-xs font-normal text-gray-400">/ay</span></p>
              <p className="text-xs text-gray-400 mt-1">{sozlesme.konut.daireNo}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aktif sözleşme yok</p>
          )}
        </Link>

        {session.rol !== "Potansiyel" && (
          <Link href="/dashboard/odemeler" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><CreditCard size={18} className="text-blue-600" /></div>
              <span className="text-sm text-gray-500">Son Ödeme</span>
            </div>
            {odemeler[0] ? (
              <>
                <p className="text-lg font-bold text-gray-800">{fmt(odemeler[0].tutar)}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtT(odemeler[0].odenmeTarihi)}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Ödeme kaydı yok</p>
            )}
          </Link>
        )}

        {session.rol !== "Potansiyel" && (
          <Link href="/dashboard/bakim" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center"><Wrench size={18} className="text-orange-600" /></div>
              <span className="text-sm text-gray-500">Talepler</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{talepler.length}</p>
            <p className="text-xs text-gray-400 mt-1">Açık talep</p>
          </Link>
        )}

        {session.rol === "Aktif" && (
          <Link href="/dashboard/duyurular" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><Megaphone size={18} className="text-purple-600" /></div>
              <span className="text-sm text-gray-500">Duyurular</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{duyurular.length}</p>
            <p className="text-xs text-gray-400 mt-1">Yeni duyuru</p>
          </Link>
        )}

        {sonFatura && (() => {
          const toplam = sonFatura.elektrik + sonFatura.su + sonFatura.dogalgaz + sonFatura.internet;
          const kota = Math.max(0, toplam - sonFatura.kotaEsigi);
          return (
            <Link href="/dashboard/faturalar" className={`rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow ${kota > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kota > 0 ? "bg-red-100" : "bg-yellow-100"}`}>
                  <Zap size={18} className={kota > 0 ? "text-red-600" : "text-yellow-600"} />
                </div>
                <span className="text-sm text-gray-500">Faturalarım</span>
              </div>
              <p className={`text-lg font-bold ${kota > 0 ? "text-red-700" : "text-gray-800"}`}>{fmt(toplam)}</p>
              <p className="text-xs text-gray-400 mt-1">{kota > 0 ? `+${fmt(kota)} kota ödemesi` : "Kota dahilinde"}</p>
            </Link>
          );
        })()}
      </div>

      {/* Sözleşme özeti */}
      {sozlesme && (
        <div className={`rounded-2xl p-5 border ${gunKaldi !== null && gunKaldi <= 30 ? "bg-orange-50 border-orange-200" : "bg-emerald-50 border-emerald-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {gunKaldi !== null && gunKaldi <= 30 ? <AlertCircle size={16} className="text-orange-600" /> : <FileText size={16} className="text-emerald-600" />}
            <span className="font-semibold text-sm text-gray-800">Sözleşme Durumu</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">Daire</p><p className="font-medium">{sozlesme.konut.daireNo} — Blok {sozlesme.konut.blok}</p></div>
            <div><p className="text-xs text-gray-500">Bitiş</p><p className="font-medium">{fmtT(sozlesme.bitisTarihi)}</p></div>
            <div><p className="text-xs text-gray-500">Kalan Süre</p><p className={`font-medium ${gunKaldi !== null && gunKaldi <= 30 ? "text-orange-600" : ""}`}>{gunKaldi !== null ? `${gunKaldi} gün` : "-"}</p></div>
            <div><p className="text-xs text-gray-500">Ödeme Günü</p><p className="font-medium">Her ayın {sozlesme.kiraOdemGunu}. günü</p></div>
          </div>
        </div>
      )}

      {/* Son duyurular — sadece aktif kiracılara */}
      {session.rol === "Aktif" && duyurular.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Son Duyurular</h2>
            <Link href="/dashboard/duyurular" className="text-xs text-emerald-600 hover:underline">Tümü</Link>
          </div>
          <div className="space-y-3">
            {duyurular.map(d => (
              <div key={d.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <Megaphone size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{d.baslik}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtT(d.tarih)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
