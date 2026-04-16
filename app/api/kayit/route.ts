import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

    const { ad, soyad, telefon, email, sifre, universite, bolum, tcKimlik } = body;

    if (!ad || !soyad || !telefon || !email || !sifre) {
      return NextResponse.json({ error: "Ad, soyad, telefon, e-posta ve şifre zorunludur." }, { status: 400 });
    }
    if (sifre.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }
    if (tcKimlik && tcKimlik.length !== 11) {
      return NextResponse.json({ error: "TC Kimlik No 11 haneli olmalıdır." }, { status: 400 });
    }

    const mevcutOgrenci = await prisma.ogrenci.findUnique({ where: { email } });
    if (mevcutOgrenci) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }

    const hashliSifre = await bcrypt.hash(sifre, 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yeniOgrenci = await (prisma.ogrenci as any).create({
      data: {
        ad, soyad, telefon, email,
        sifre: hashliSifre,
        universite: universite || null,
        bolum: bolum || null,
        tcKimlik: tcKimlik || null,
        rol: "Potansiyel",
      },
    });

    let notlar = "Kiracı portalından kayıt oldu.";
    if (universite) notlar += ` Üniversite: ${universite.toUpperCase()}.`;
    if (bolum) notlar += ` Bölüm: ${bolum.toUpperCase()}.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.potansiyelMusteri as any).create({
      data: {
        ad, soyad, telefon, email,
        kaynak: "KiraciPortal",
        durum: "Yeni",
        notlar,
        ogrenciId: yeniOgrenci.id,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[kayit]", e);
    return NextResponse.json({ error: "Sunucu hatası, lütfen tekrar deneyin." }, { status: 500 });
  }
}
