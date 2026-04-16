"use client";

import { useState } from "react";
import { CheckCircle, Clock, Users, FileText, Home, CreditCard, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Onay {
  onaylayan: string;
  onaylayanAd: string;
  tarih: string;
}

interface PendingSozlesme {
  id: string;
  sozlesmeNo: string;
  durum: string;
  aylikKira: number;
  depozito: number;
  kiraOdemGunu: number;
  baslangicTarihi: string;
  bitisTarihi: string;
  ozelSartlar: string | null;
  onaylar: Onay[];
  konut: { daireNo: string; blok: string; etap: number; tip: string; metrekare: number };
}

const ONAYLAYANLAR = [
  { key: "KiralamaSorumlusu", label: "Kiralama Sorumlusu" },
  { key: "Muhasebeci", label: "Muhasebe" },
  { key: "Admin", label: "Yönetici" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
const fmtT = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

export default function ImzaSection({ sozlesme: initial }: { sozlesme: PendingSozlesme }) {
  const [sozlesme, setSozlesme] = useState(initial);
  const [imzalaniyor, setImzalaniyor] = useState(false);
  const [imzalandi, setImzalandi] = useState(false);
  const [hata, setHata] = useState("");

  const imzala = async () => {
    setImzalaniyor(true);
    setHata("");
    const res = await fetch("/api/portal/sozlesme", { method: "POST" });
    const j = await res.json();
    if (!res.ok) {
      setHata(j.error ?? "Hata oluştu.");
      setImzalaniyor(false);
      return;
    }
    setImzalandi(true);
    setSozlesme(prev => ({ ...prev, durum: "ImzalandiOnayBekliyor" }));
    setImzalaniyor(false);
  };

  const durum = sozlesme.durum;
  const imzaBekleniyor = durum === "BekleniyorImza";
  const onayBekleniyor = durum === "ImzalandiOnayBekliyor";
  const tamOnaylandi = durum === "OnaylandiAktifBekliyor";

  const durumLabel = imzaBekleniyor
    ? "İmza Bekliyor"
    : onayBekleniyor
    ? "Onay Sürecinde"
    : "Onaylandı — Başlangıç Bekleniyor";

  const durumColor = imzaBekleniyor
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : onayBekleniyor
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`px-6 py-4 ${imzaBekleniyor ? "bg-amber-500" : tamOnaylandi ? "bg-emerald-600" : "bg-blue-600"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${imzaBekleniyor ? "text-amber-100" : "text-white/70"}`}>Sözleşme No</p>
              <p className="text-white font-mono font-semibold">{sozlesme.sozlesmeNo}</p>
            </div>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/30">
              {durumLabel}
            </span>
          </div>
        </div>

        {/* Adımlar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[
              { label: "Sözleşme Gönderildi", done: true },
              { label: "Kiracı İmzası", done: !imzaBekleniyor },
              { label: "Onay Süreci", done: tamOnaylandi },
              { label: "Aktif Kiracı", done: false },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  step.done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">{step.label}</span>
                {i < arr.length - 1 && <div className="h-px bg-gray-200 flex-1 min-w-2 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Detaylar */}
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

        {sozlesme.ozelSartlar && (
          <div className="px-6 pb-5">
            <p className="text-xs text-gray-500 mb-1">Özel Şartlar</p>
            <p className="text-sm text-gray-600 bg-amber-50 rounded-xl p-3 border border-amber-100">{sozlesme.ozelSartlar}</p>
          </div>
        )}
      </div>

      {/* Onay Durumu */}
      {(onayBekleniyor || imzalandi || tamOnaylandi) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800">3 Taraflı Onay Süreci</h2>
          </div>
          {ONAYLAYANLAR.map(({ key, label }) => {
            const onay = sozlesme.onaylar?.find(o => o.onaylayan === key);
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${onay ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                {onay ? (
                  <span className="text-xs text-emerald-600 font-medium">
                    ✓ {format(new Date(onay.tarih), "d MMM", { locale: tr })}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Bekliyor</span>
                )}
              </div>
            );
          })}
          {tamOnaylandi && (
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <CheckCircle className="text-emerald-500 mx-auto mb-1" size={20} />
              <p className="text-sm font-medium text-emerald-700">
                Sözleşme onaylandı! {fmtT(sozlesme.baslangicTarihi)} tarihinde aktif kiracı olacaksınız.
              </p>
            </div>
          )}
        </div>
      )}

      {/* İmzalama */}
      {imzaBekleniyor && !imzalandi && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock size={16} />
            <h2 className="font-semibold">Sözleşmeyi İmzala</h2>
          </div>
          <p className="text-sm text-gray-600">
            Yukarıdaki sözleşme koşullarını okudum ve kabul ediyorum. İmzalamak için butona tıklayın.
          </p>
          {hata && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{hata}</p>}
          <button
            onClick={imzala}
            disabled={imzalaniyor}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {imzalaniyor ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> İmzalanıyor...</>
            ) : (
              <><CheckCircle size={18} /> Sözleşmeyi Dijital Olarak İmzala</>
            )}
          </button>
        </div>
      )}

      {(imzalandi || (onayBekleniyor && !tamOnaylandi)) && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center space-y-2">
          <CheckCircle className="text-emerald-500 mx-auto" size={28} />
          <p className="font-semibold text-emerald-800">Sözleşme imzalandı!</p>
          <p className="text-sm text-emerald-600">3 taraflı onay süreci devam ediyor. Onaylar tamamlandığında aktif kiracı olacaksınız.</p>
        </div>
      )}
    </div>
  );
}
