"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, Users, LogOut } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Onay {
  onaylayan: string;
  onaylayanAd: string;
  tarih: string;
}

interface Sozlesme {
  id: string;
  sozlesmeNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  aylikKira: number;
  depozito: number;
  kiraOdemGunu: number;
  ozelSartlar: string | null;
  durum: string;
  imzaTarihi: string;
  konut: { blok: string; katNo: number; daireNo: string; tip: string };
  onaylar: Onay[];
}

const ONAYLAYANLAR = [
  { key: "KiralamaSorumlusu", label: "Kiralama Sorumlusu" },
  { key: "Muhasebeci", label: "Muhasebe" },
  { key: "Admin", label: "Yönetici" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
const fmtT = (d: string) => format(new Date(d), "d MMMM yyyy", { locale: tr });

export default function SozlesmeImzaPage() {
  const [sozlesme, setSozlesme] = useState<Sozlesme | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [imzalaniyor, setImzalaniyor] = useState(false);
  const [imzalandi, setImzalandi] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    fetch("/api/portal/sozlesme")
      .then(r => r.json())
      .then(d => { setSozlesme(d); setYukleniyor(false); })
      .catch(() => setYukleniyor(false));
  }, []);

  const imzala = async () => {
    setImzalaniyor(true);
    setHata("");
    const res = await fetch("/api/portal/sozlesme", { method: "POST" });
    const j = await res.json();
    if (!res.ok) { setHata(j.error ?? "Hata oluştu."); setImzalaniyor(false); return; }
    setImzalandi(true);
    setSozlesme(prev => prev ? { ...prev, durum: "ImzalandiOnayBekliyor" } : prev);
    setImzalaniyor(false);
  };

  const cikis = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/giris";
  };

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sozlesme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <Clock className="text-emerald-500 mx-auto" size={40} />
          <h1 className="text-xl font-bold text-gray-900">Sözleşme Hazırlanıyor</h1>
          <p className="text-gray-500 text-sm">Kiralama temsilciniz sözleşmenizi hazırlayacak ve size gönderecektir.</p>
          <button onClick={cikis} className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-gray-600">
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  const imzaBekleniyor = sozlesme.durum === "BekleniyorImza";
  const onayBekleniyor = sozlesme.durum === "ImzalandiOnayBekliyor";
  const tamOnaylandi = sozlesme.durum === "OnaylandiAktifBekliyor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Kira Sözleşmesi</h1>
              <p className="text-xs text-gray-500">{sozlesme.sozlesmeNo}</p>
            </div>
          </div>
          <button onClick={cikis} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
            <LogOut size={14} /> Çıkış
          </button>
        </div>

        {/* Durum Adımları */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 justify-between">
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
                <span className="text-xs text-gray-500 hidden sm:block flex-1">{step.label}</span>
                {i < arr.length - 1 && <div className="h-px bg-gray-200 flex-1 min-w-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Sözleşme Detayları */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Sözleşme Detayları</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Daire</p>
              <p className="font-semibold text-gray-900">{sozlesme.konut.daireNo}</p>
              <p className="text-xs text-gray-400">{sozlesme.konut.blok} Blok, {sozlesme.konut.katNo}. Kat</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Aylık Kira</p>
              <p className="font-semibold text-emerald-600">{fmt(sozlesme.aylikKira)}</p>
              <p className="text-xs text-gray-400">Her ayın {sozlesme.kiraOdemGunu}. günü</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Başlangıç</p>
              <p className="font-semibold text-gray-900">{fmtT(sozlesme.baslangicTarihi)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Bitiş</p>
              <p className="font-semibold text-gray-900">{fmtT(sozlesme.bitisTarihi)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Depozito</p>
              <p className="font-semibold text-gray-900">{fmt(sozlesme.depozito)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Daire Tipi</p>
              <p className="font-semibold text-gray-900">{sozlesme.konut.tip}</p>
            </div>
          </div>
          {sozlesme.ozelSartlar && (
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-medium text-amber-700 mb-1">Özel Şartlar</p>
              <p className="text-sm text-gray-700">{sozlesme.ozelSartlar}</p>
            </div>
          )}
        </div>

        {/* Onay Durumu */}
        {(onayBekleniyor || tamOnaylandi) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
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
                  Sözleşme onaylandı! Başlangıç tarihinde aktif kiracı olacaksınız.
                </p>
              </div>
            )}
          </div>
        )}

        {/* İmzalama Butonu */}
        {imzaBekleniyor && !imzalandi && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="text-sm text-gray-600">
              Yukarıdaki sözleşme koşullarını okudum ve kabul ediyorum.
              İmzalamak için aşağıdaki butona tıklayın.
            </p>
            {hata && <p className="text-sm text-red-500">{hata}</p>}
            <button
              onClick={imzala}
              disabled={imzalaniyor}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {imzalaniyor ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> İmzalanıyor...</>
              ) : (
                <><CheckCircle size={18} /> Sözleşmeyi Dijital Olarak İmzala</>
              )}
            </button>
          </div>
        )}

        {(imzalandi || onayBekleniyor) && !tamOnaylandi && (
          <div className="bg-emerald-50 rounded-2xl p-5 text-center space-y-2">
            <CheckCircle className="text-emerald-500 mx-auto" size={28} />
            <p className="font-semibold text-emerald-800">Sözleşme imzalandı!</p>
            <p className="text-sm text-emerald-600">3 taraflı onay süreci devam ediyor. Onaylar tamamlandığında sizi bilgilendireceğiz.</p>
          </div>
        )}
      </div>
    </div>
  );
}
