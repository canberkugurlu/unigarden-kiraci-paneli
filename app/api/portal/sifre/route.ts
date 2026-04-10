import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { mevcutSifre, yeniSifre } = await req.json();
  if (!mevcutSifre || !yeniSifre || yeniSifre.length < 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const ogrenci = await prisma.ogrenci.findUnique({ where: { id: session.id } });
  if (!ogrenci?.sifre) return NextResponse.json({ error: "Şifre bulunamadı" }, { status: 404 });

  const eslesti = await bcrypt.compare(mevcutSifre, ogrenci.sifre);
  if (!eslesti) return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 401 });

  const hash = await bcrypt.hash(yeniSifre, 10);
  await prisma.ogrenci.update({ where: { id: session.id }, data: { sifre: hash } });
  return NextResponse.json({ ok: true });
}
