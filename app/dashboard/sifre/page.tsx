"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function SifrePage() {
  const [form, setForm] = useState({ mevcutSifre: "", yeniSifre: "", tekrar: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.yeniSifre !== form.tekrar) { setMesaj({ tip: "hata", text: "Yeni şifreler eşleşmiyor." }); return; }
    if (form.yeniSifre.length < 6) { setMesaj({ tip: "hata", text: "Şifre en az 6 karakter olmalı." }); return; }
    setSaving(true); setMesaj(null);
    const res = await fetch("/api/portal/sifre", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mevcutSifre: form.mevcutSifre, yeniSifre: form.yeniSifre }) });
    setSaving(false);
    if (res.ok) { setMesaj({ tip: "ok", text: "Şifreniz başarıyla güncellendi." }); setForm({ mevcutSifre: "", yeniSifre: "", tekrar: "" }); }
    else { const j = await res.json(); setMesaj({ tip: "hata", text: j.error ?? "Hata oluştu." }); }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Şifre Değiştir</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><KeyRound size={18} className="text-blue-600" /></div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Hesap Güvenliği</p>
            <p className="text-xs text-gray-400">Güçlü bir şifre kullanın</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Mevcut Şifre</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={form.mevcutSifre} onChange={e => setForm(f => ({ ...f, mevcutSifre: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
              <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yeni Şifre</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={form.yeniSifre} onChange={e => setForm(f => ({ ...f, yeniSifre: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="En az 6 karakter" />
              <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Yeni Şifre (Tekrar)</label>
            <input type="password" value={form.tekrar} onChange={e => setForm(f => ({ ...f, tekrar: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
          </div>

          {mesaj && (
            <div className={`rounded-xl px-4 py-3 text-xs ${mesaj.tip === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {mesaj.text}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60">
            {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
