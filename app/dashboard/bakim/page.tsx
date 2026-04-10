"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Wrench, X, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BakimTalebi {
  id: string; baslik: string; aciklama: string; durum: string; oncelik: string;
  olusturmaTar: string; tamamlanmaTar?: string;
  konut: { daireNo: string; blok: string };
}

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Islemde: "bg-blue-100 text-blue-700",
  Tamamlandi: "bg-green-100 text-green-700",
  Iptal: "bg-gray-100 text-gray-500",
};
const DURUM_LABEL: Record<string, string> = { Bekliyor: "Bekliyor", Islemde: "İşlemde", Tamamlandi: "Tamamlandı", Iptal: "İptal" };
const ONCELIK_RENK: Record<string, string> = { Dusuk: "bg-gray-100 text-gray-500", Normal: "bg-blue-100 text-blue-600", Yuksek: "bg-orange-100 text-orange-700", Acil: "bg-red-100 text-red-700" };
const ONCELIK_LABEL: Record<string, string> = { Dusuk: "Düşük", Normal: "Normal", Yuksek: "Yüksek", Acil: "Acil" };

function YeniTalepModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ baslik: "", aciklama: "", oncelik: "Normal" });
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.baslik || !form.aciklama) { setHata("Başlık ve açıklama zorunludur."); return; }
    setSaving(true); setHata("");
    const res = await fetch("/api/portal/bakim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata oluştu."); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Yeni Bakım Talebi</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Başlık</label>
            <input value={form.baslik} onChange={e => setForm(f => ({ ...f, baslik: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Örn: Klima arızası, Su kaçağı..." />
          </div>
          <div>
            <label className="text-xs text-gray-500">Açıklama</label>
            <textarea value={form.aciklama} onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))}
              rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Sorunu detaylı açıklayın..." />
          </div>
          <div>
            <label className="text-xs text-gray-500">Öncelik</label>
            <select value={form.oncelik} onChange={e => setForm(f => ({ ...f, oncelik: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Object.entries(ONCELIK_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded-xl px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm">İptal</button>
          <button onClick={submit} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BakimPage() {
  const [talepler, setTalepler] = useState<BakimTalebi[]>([]);
  const [modal, setModal] = useState(false);
  const [acik, setAcik] = useState<string | null>(null);

  const load = useCallback(() => fetch("/api/portal/bakim").then(r => r.json()).then(setTalepler), []);
  useEffect(() => { load(); }, [load]);

  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });

  const bekleyen = talepler.filter(t => t.durum === "Bekliyor" || t.durum === "Islemde");
  const tamamlanan = talepler.filter(t => t.durum === "Tamamlandi" || t.durum === "Iptal");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bakım Bildirimi</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700">
          <Plus size={16} /> Yeni Talep
        </button>
      </div>

      {talepler.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Wrench size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Henüz bakım talebiniz yok</p>
          <p className="text-sm mt-1">Dairenizdeki bir sorunu bildirmek için yukarıdaki butonu kullanın.</p>
        </div>
      )}

      {bekleyen.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Açık Talepler</p>
          <div className="space-y-3">
            {bekleyen.map(t => (
              <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setAcik(acik === t.id ? null : t.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"><Wrench size={14} className="text-orange-600" /></div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{t.baslik}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum]}`}>{DURUM_LABEL[t.durum]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ONCELIK_RENK[t.oncelik]}`}>{ONCELIK_LABEL[t.oncelik]}</span>
                      </div>
                    </div>
                  </div>
                  {acik === t.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {acik === t.id && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mt-3">{t.aciklama}</p>
                    <p className="text-xs text-gray-400 mt-2">Gönderildi: {fmtT(t.olusturmaTar)}</p>
                    <p className="text-xs text-gray-400">Daire: {t.konut.daireNo}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tamamlanan.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tamamlanan / İptal</p>
          <div className="space-y-2">
            {tamamlanan.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-3 flex items-center justify-between opacity-70">
                <div>
                  <p className="text-sm text-gray-700">{t.baslik}</p>
                  <p className="text-xs text-gray-400">{fmtT(t.olusturmaTar)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum]}`}>{DURUM_LABEL[t.durum]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && <YeniTalepModal onClose={() => setModal(false)} onSaved={load} />}
    </div>
  );
}
