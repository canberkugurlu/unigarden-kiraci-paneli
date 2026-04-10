import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, sifre } = await req.json();
  if (!email || !sifre) {
    return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
  }

  const ogrenci = await prisma.ogrenci.findUnique({ where: { email } });
  if (!ogrenci || !ogrenci.sifre) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const eslesti = await bcrypt.compare(sifre, ogrenci.sifre);
  if (!eslesti) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const token = await signToken({ id: ogrenci.id, ad: ogrenci.ad, soyad: ogrenci.soyad, email: ogrenci.email });

  const res = NextResponse.json({ ok: true, ad: ogrenci.ad, soyad: ogrenci.soyad });
  res.cookies.set(COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
