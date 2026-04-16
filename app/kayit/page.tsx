"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from "lucide-react";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ad: "", soyad: "", telefon: "", email: "",
    sifre: "", sifreTekrar: "",
    universite: "", bolum: "", tcKimlik: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const [basarili, setBasarili] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");

    if (!form.ad || !form.soyad || !form.telefon || !form.email || !form.sifre) {
      setHata("Zorunlu alanları doldurunuz."); return;
    }
    if (form.sifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalıdır."); return;
    }
    if (form.sifre !== form.sifreTekrar) {
      setHata("Şifreler eşleşmiyor."); return;
    }
    if (form.tcKimlik && form.tcKimlik.length !== 11) {
      setHata("TC Kimlik No 11 haneli olmalıdır."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: form.ad, soyad: form.soyad, telefon: form.telefon,
          email: form.email, sifre: form.sifre,
          universite: form.universite || undefined,
          bolum: form.bolum || undefined,
          tcKimlik: form.tcKimlik || undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setHata(j.error ?? "Kayıt başarısız."); return; }
      setBasarili(true);
    } catch {
      setHata("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (basarili) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <CheckCircle className="text-emerald-600" size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kayıt Tamamlandı!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Başvurunuz alındı. Kiralama temsilcimiz sizinle iletişime geçecek ve sözleşme sürecini başlatacaktır.
          </p>
          <Link href="/giris"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <ArrowLeft size={16} /> Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-3 shadow-lg">
            <span className="text-white font-bold text-lg">UG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">UNIGARDEN</h1>
          <p className="text-gray-500 text-sm mt-1">Kiracı Portalı — Kayıt Ol</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Yeni Hesap Oluştur</h2>

          <form onSubmit={submit} className="space-y-4">
            {/* Ad / Soyad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Ad <span className="text-red-500">*</span></label>
                <input value={form.ad} onChange={set("ad")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Adınız" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Soyad <span className="text-red-500">*</span></label>
                <input value={form.soyad} onChange={set("soyad")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Soyadınız" />
              </div>
            </div>

            {/* Telefon / E-posta */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Telefon <span className="text-red-500">*</span></label>
                <input value={form.telefon} onChange={set("telefon")} type="tel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="05xx xxx xx xx" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">E-posta <span className="text-red-500">*</span></label>
                <input value={form.email} onChange={set("email")} type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ornek@email.com" />
              </div>
            </div>

            {/* Üniversite / Bölüm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Üniversite</label>
                <input value={form.universite} onChange={set("universite")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Üniversite adı" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Bölüm</label>
                <input value={form.bolum} onChange={set("bolum")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Bölüm adı" />
              </div>
            </div>

            {/* TC Kimlik */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">TC Kimlik No</label>
              <input value={form.tcKimlik} onChange={set("tcKimlik")} maxLength={11}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="11 haneli TC kimlik (opsiyonel)" />
            </div>

            {/* Şifre */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Şifre <span className="text-red-500">*</span></label>
              <div className="relative">
                <input value={form.sifre} onChange={set("sifre")}
                  type={showPass ? "text" : "password"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="En az 6 karakter" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Şifre Tekrar <span className="text-red-500">*</span></label>
              <input value={form.sifreTekrar} onChange={set("sifreTekrar")}
                type={showPass ? "text" : "password"}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Şifrenizi tekrar girin" />
            </div>

            {hata && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">{hata}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <UserPlus size={16} />}
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-emerald-600 hover:underline font-medium">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
