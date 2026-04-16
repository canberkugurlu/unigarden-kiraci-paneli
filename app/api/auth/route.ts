import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, sifre } = await req.json().catch(() => ({}));
  let ogrenci = null as Awaited<ReturnType<typeof prisma.ogrenci.findUnique>> | null;

  if (!email || !sifre) {
    // Boş form → ilk öğrenciyi otomatik giriş
    ogrenci = await prisma.ogrenci.findFirst({
      orderBy: [{ olusturmaTar: "asc" }],
    });
    if (!ogrenci) {
      return NextResponse.json({ error: "Sistemde kayıtlı kiracı yok." }, { status: 404 });
    }
  } else {
    ogrenci = await prisma.ogrenci.findUnique({ where: { email } });
    if (!ogrenci || !ogrenci.sifre) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    const eslesti = await bcrypt.compare(sifre, ogrenci.sifre);
    if (!eslesti) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
  }

  // Sözleşme başlangıç tarihine göre otomatik aktifleştir (tüm roller için)
  let rol = (ogrenci as { rol?: string }).rol ?? "Aktif";
  const aktifSozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: ogrenci.id, durum: "OnaylandiAktifBekliyor", baslangicTarihi: { lte: new Date() } },
  });
  if (aktifSozlesme) {
    await prisma.sozlesme.update({ where: { id: aktifSozlesme.id }, data: { durum: "Aktif" } });
    await (prisma.ogrenci as unknown as { update: Function }).update({ where: { id: ogrenci.id }, data: { rol: "Aktif" } });
    rol = "Aktif";
    // Cross-panel: kiralama CRM lead durumunu AktifKiraci yap
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lead = await (prisma.potansiyelMusteri as any).findFirst({ where: { ogrenciId: ogrenci.id } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (lead) await (prisma.potansiyelMusteri as any).update({ where: { id: lead.id }, data: { durum: "AktifKiraci" } });
    } catch { /* sessizce atla */ }
  }
  const token = await signToken({ id: ogrenci.id, ad: ogrenci.ad, soyad: ogrenci.soyad, email: ogrenci.email ?? "", rol });

  const res = NextResponse.json({ ok: true, ad: ogrenci.ad, soyad: ogrenci.soyad });
  res.cookies.set(COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
