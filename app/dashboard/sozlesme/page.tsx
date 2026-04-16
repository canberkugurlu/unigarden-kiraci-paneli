export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, Home, Calendar, CreditCard, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import ImzaSection from "./ImzaSection";

const PENDING_DURUMLAR = ["BekleniyorImza", "ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor"];

export default async function SozlesmePage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
    include: { konut: { include: { daireSahibi: true } } },
  });

  const pendingSozlesme = !sozlesme
    ? await prisma.sozlesme.findFirst({
        where: { ogrenciId: session.id, durum: { in: PENDING_DURUMLAR } },
        include: { konut: true, onaylar: true },
        orderBy: { olusturmaTar: "desc" },
      })
    : null;

  const gecmisSozlesmeler = await prisma.sozlesme.findMany({
    where: {
      ogrenciId: session.id,
      durum: { notIn: ["Aktif", ...PENDING_DURUMLAR] },
    },
    include: { konut: true },
    orderBy: { olusturmaTar: "desc" },
  });

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
  const fmtT = (d: string | Date) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const ozellikler = sozlesme?.konut.ozellikler
    ? (() => { try { return JSON.parse(sozlesme.konut.ozellikler!); } catch { return []; } })()
    : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Sözleşmem</h1>

      {sozlesme ? (
        <>
          {/* Daire Bilgileri */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs">Sözleşme No</p>
                  <p className="text-white font-mono font-semibold">{sozlesme.sozlesmeNo}</p>
                </div>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Aktif</span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <Home size={16} className="text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Daire</p>
                  <p className="font-semibold text-gray-800">{sozlesme.konut.daireNo}</p>
                  <p className="text-xs text-gray-400">Blok {sozlesme.konut.blok} · {sozlesme.konut.etap}. Etap</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Daire Tipi</p>
                  <p className="font-semibold text-gray-800">{sozlesme.konut.tip}</p>
                  <p className="text-xs text-gray-400">{sozlesme.konut.metrekare} m²</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={16} className="text-purple-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Aylık Kira</p>
                  <p className="font-semibold text-gray-800">{fmt(sozlesme.aylikKira)}</p>
                  <p className="text-xs text-gray-400">Her ayın {sozlesme.kiraOdemGunu}. günü</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Başlangıç</p>
                  <p className="font-semibold text-gray-800">{fmtT(sozlesme.baslangicTarihi)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Bitiş</p>
                  <p className="font-semibold text-gray-800">{fmtT(sozlesme.bitisTarihi)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Depozito</p>
                  <p className="font-semibold text-gray-800">{fmt(sozlesme.depozito)}</p>
                </div>
              </div>
            </div>

            {ozellikler.length > 0 && (
              <div className="px-6 pb-5">
                <p className="text-xs text-gray-500 mb-2">Daire Özellikleri</p>
                <div className="flex flex-wrap gap-1.5">
                  {ozellikler.map((o: string) => (
                    <span key={o} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">{o}</span>
                  ))}
                </div>
              </div>
            )}

            {sozlesme.ozelSartlar && (
              <div className="px-6 pb-5">
                <p className="text-xs text-gray-500 mb-1">Özel Şartlar</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{sozlesme.ozelSartlar}</p>
              </div>
            )}
          </div>

          {/* Daire Sahibi */}
          {sozlesme.konut.daireSahibi && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">Daire Sahibi</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600">
                  {sozlesme.konut.daireSahibi.ad[0]}{sozlesme.konut.daireSahibi.soyad[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{sozlesme.konut.daireSahibi.ad} {sozlesme.konut.daireSahibi.soyad}</p>
                  <p className="text-xs text-gray-400">{sozlesme.konut.daireSahibi.telefon}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : pendingSozlesme ? (
        <ImzaSection sozlesme={{
          id: pendingSozlesme.id,
          sozlesmeNo: pendingSozlesme.sozlesmeNo,
          durum: pendingSozlesme.durum,
          aylikKira: pendingSozlesme.aylikKira,
          depozito: pendingSozlesme.depozito,
          kiraOdemGunu: pendingSozlesme.kiraOdemGunu,
          baslangicTarihi: pendingSozlesme.baslangicTarihi.toString(),
          bitisTarihi: pendingSozlesme.bitisTarihi.toString(),
          ozelSartlar: pendingSozlesme.ozelSartlar ?? null,
          onaylar: (pendingSozlesme.onaylar ?? []).map(o => ({
            onaylayan: o.onaylayan,
            onaylayanAd: o.onaylayanAd,
            tarih: o.tarih.toString(),
          })),
          konut: {
            daireNo: pendingSozlesme.konut.daireNo,
            blok: pendingSozlesme.konut.blok,
            etap: pendingSozlesme.konut.etap,
            tip: pendingSozlesme.konut.tip,
            metrekare: pendingSozlesme.konut.metrekare,
          },
        }} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Aktif sözleşme bulunamadı</p>
        </div>
      )}

      {/* Geçmiş sözleşmeler */}
      {gecmisSozlesmeler.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-gray-400" /> Geçmiş Sözleşmeler
          </h2>
          <div className="space-y-2">
            {gecmisSozlesmeler.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-mono text-gray-600">{s.sozlesmeNo}</p>
                  <p className="text-xs text-gray-400">{s.konut.daireNo} · {fmtT(s.baslangicTarihi)} — {fmtT(s.bitisTarihi)}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.durum}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
