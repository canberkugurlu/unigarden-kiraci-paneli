"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wrench, ShieldAlert, Flame, Zap, Wifi, Droplets,
  Volume2, Sofa, ChevronDown, ChevronUp, X, CheckCircle, Clock, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BakimTalebi {
  id: string; baslik: string; aciklama: string; durum: string;
  oncelik: string; kategori: string; olusturmaTar: string; tamamlanmaTar?: string;
  konut: { daireNo: string; blok: string };
}

const KATEGORILER = [
  {
    key: "Teknik",
    label: "Teknik Talepler",
    desc: "Elektrik, su, doğalgaz, internet, klima",
    icon: Wrench,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    altKategoriler: ["Elektrik arızası", "Su/tesisat sorunu", "Doğalgaz sorunu", "İnternet/TV arızası", "Klima / ısıtma sorunu", "Asansör arızası"],
  },
  {
    key: "Guvenlik",
    label: "Güvenlik Talepleri",
    desc: "Kayıp kart, kilit, kapı, kamera sorunları",
    icon: ShieldAlert,
    color: "bg-red-50 border-red-200 text-red-700",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    altKategoriler: ["Kayıp/kırık kart", "Kilit/kapı sorunu", "Güvenlik kamerası", "Yangın tüpü kontrolü", "Turnike arızası"],
  },
  {
    key: "Temizlik",
    label: "Temizlik Talepleri",
    desc: "Ortak alan, çöp, dezenfeksiyon",
    icon: Droplets,
    color: "bg-cyan-50 border-cyan-200 text-cyan-700",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    altKategoriler: ["Ortak alan temizliği", "Çöp sorunu", "Daire temizliği", "Dezenfeksiyon talebi", "Haşere/böcek ilaçlama"],
  },
  {
    key: "Gurultu",
    label: "Gürültü & Şikayet",
    desc: "Komşu gürültüsü, genel şikayetler",
    icon: Volume2,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    altKategoriler: ["Gürültü şikayeti", "Komşu sorunu", "Ortak alan şikayeti"],
  },
  {
    key: "Mobilya",
    label: "Mobilya & Eşya",
    desc: "Mobilya, beyaz eşya, demirbaş sorunları",
    icon: Sofa,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    altKategoriler: ["Mobilya hasarı", "Beyaz eşya arızası", "Pencere/panjur sorunu", "Boya/badana talebi"],
  },
  {
    key: "Diger",
    label: "Diğer Talepler",
    desc: "Diğer konular, öneri, bilgi talebi",
    icon: MoreHorizontal,
    color: "bg-gray-50 border-gray-200 text-gray-700",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    altKategoriler: ["Genel öneri", "Bilgi talebi", "Diğer"],
  },
];

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Islemde: "bg-blue-100 text-blue-700",
  Tamamlandi: "bg-green-100 text-green-700",
  Iptal: "bg-gray-100 text-gray-500",
};
const DURUM_LABEL: Record<string, string> = {
  Bekliyor: "Bekliyor", Islemde: "İşlemde", Tamamlandi: "Tamamlandı", Iptal: "İptal",
};
const ONCELIK_RENK: Record<string, string> = {
  Dusuk: "bg-gray-100 text-gray-500", Normal: "bg-blue-100 text-blue-600",
  Yuksek: "bg-orange-100 text-orange-700", Acil: "bg-red-100 text-red-700",
};
const ONCELIK_LABEL: Record<string, string> = {
  Dusuk: "Düşük", Normal: "Normal", Yuksek: "Yüksek", Acil: "Acil",
};

function YeniTalepModal({
  kategoriKey, onClose, onSaved,
}: {
  kategoriKey: string; onClose: () => void; onSaved: () => void;
}) {
  const kat = KATEGORILER.find(k => k.key === kategoriKey)!;
  const [form, setForm] = useState({ baslik: "", aciklama: "", oncelik: "Normal", kategori: kategoriKey });
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.baslik || !form.aciklama) { setHata("Başlık ve açıklama zorunludur."); return; }
    setSaving(true); setHata("");
    const res = await fetch("/api/portal/bakim", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata oluştu."); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${kat.iconBg} flex items-center justify-center`}>
              <kat.icon size={18} className={kat.iconColor} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{kat.label}</h3>
              <p className="text-xs text-gray-400">Yeni talep oluştur</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Konu</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {kat.altKategoriler.map(alt => (
                <button
                  key={alt}
                  onClick={() => setForm(f => ({ ...f, baslik: alt }))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.baslik === alt
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-gray-200 text-gray-600 hover:border-emerald-400"
                  }`}
                >
                  {alt}
                </button>
              ))}
            </div>
            <input
              value={form.baslik}
              onChange={e => setForm(f => ({ ...f, baslik: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="veya kendi konunuzu yazın..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Açıklama</label>
            <textarea
              value={form.aciklama}
              onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))}
              rows={3}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Sorunu detaylı açıklayın..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Öncelik</label>
            <div className="flex gap-2 mt-1.5">
              {Object.entries(ONCELIK_LABEL).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setForm(f => ({ ...f, oncelik: k }))}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors ${
                    form.oncelik === k
                      ? ONCELIK_RENK[k] + " border-current font-medium"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded-xl px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">İptal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Gönderiliyor..." : "Talep Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaleplerPage() {
  const [talepler, setTalepler] = useState<BakimTalebi[]>([]);
  const [aktifKategori, setAktifKategori] = useState<string | null>(null);
  const [acik, setAcik] = useState<string | null>(null);
  const [sekme, setSekme] = useState<"acik" | "gecmis">("acik");

  const load = useCallback(() =>
    fetch("/api/portal/bakim").then(r => r.json()).then(setTalepler), []);
  useEffect(() => { load(); }, [load]);

  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });

  const acikTalepler = talepler.filter(t => t.durum === "Bekliyor" || t.durum === "Islemde");
  const gecmisTalepler = talepler.filter(t => t.durum === "Tamamlandi" || t.durum === "Iptal");
  const gosterilen = sekme === "acik" ? acikTalepler : gecmisTalepler;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Talepler</h1>
        <p className="text-sm text-gray-400 mt-0.5">Sorun bildirin veya talep oluşturun</p>
      </div>

      {/* Kategori Kartları */}
      <div className="grid grid-cols-2 gap-3">
        {KATEGORILER.map(kat => (
          <button
            key={kat.key}
            onClick={() => setAktifKategori(kat.key)}
            className={`flex items-start gap-3 p-4 rounded-2xl border text-left hover:shadow-md transition-all ${kat.color}`}
          >
            <div className={`w-10 h-10 rounded-xl ${kat.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              <kat.icon size={19} className={kat.iconColor} />
            </div>
            <div>
              <p className="font-semibold text-sm leading-snug">{kat.label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-snug">{kat.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Talep Listesi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Sekmeler */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setSekme("acik")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              sekme === "acik" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500"
            }`}
          >
            <Clock size={14} /> Açık Talepler
            {acikTalepler.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full">{acikTalepler.length}</span>
            )}
          </button>
          <button
            onClick={() => setSekme("gecmis")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              sekme === "gecmis" ? "text-gray-700 border-b-2 border-gray-700" : "text-gray-500"
            }`}
          >
            <CheckCircle size={14} /> Geçmiş
            {gecmisTalepler.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{gecmisTalepler.length}</span>
            )}
          </button>
        </div>

        {gosterilen.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wrench size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{sekme === "acik" ? "Açık talebiniz yok" : "Geçmiş talebiniz yok"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {gosterilen.map(t => {
              const kat = KATEGORILER.find(k => k.key === t.kategori) ?? KATEGORILER[KATEGORILER.length - 1];
              return (
                <div key={t.id}>
                  <button className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setAcik(acik === t.id ? null : t.id)}>
                    <div className={`w-8 h-8 rounded-xl ${kat.iconBg} flex items-center justify-center shrink-0`}>
                      <kat.icon size={14} className={kat.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{t.baslik}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum]}`}>{DURUM_LABEL[t.durum]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ONCELIK_RENK[t.oncelik]}`}>{ONCELIK_LABEL[t.oncelik]}</span>
                      </div>
                    </div>
                    {acik === t.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </button>
                  {acik === t.id && (
                    <div className="px-5 pb-4 bg-gray-50/50">
                      <p className="text-sm text-gray-600 mb-2">{t.aciklama}</p>
                      <p className="text-xs text-gray-400">Gönderildi: {fmtT(t.olusturmaTar)}</p>
                      <p className="text-xs text-gray-400">Daire: {t.konut.daireNo} — Blok {t.konut.blok}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {aktifKategori && (
        <YeniTalepModal
          kategoriKey={aktifKategori}
          onClose={() => setAktifKategori(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
