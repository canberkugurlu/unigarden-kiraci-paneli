import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Aktif kiracı için normal sözleşme
  if (session.rol === "Aktif") {
    const sozlesme = await prisma.sozlesme.findFirst({
      where: { ogrenciId: session.id, durum: "Aktif" },
      include: { konut: true, odemeler: { orderBy: { odenmeTarihi: "desc" }, take: 3 } },
    });
    return NextResponse.json(sozlesme);
  }

  // Pasif kiracı için bekleyen sözleşme
  const sozlesme = await prisma.sozlesme.findFirst({
    where: {
      ogrenciId: session.id,
      durum: { in: ["BekleniyorImza", "ImzalandiOnayBekliyor", "OnaylandiAktifBekliyor"] },
    },
    include: {
      konut: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onaylar: true as any,
    },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(sozlesme);
}

// Kiracı sözleşmeyi imzalar
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "BekleniyorImza" },
  });
  if (!sozlesme) return NextResponse.json({ error: "İmzalanacak sözleşme bulunamadı." }, { status: 404 });

  await prisma.sozlesme.update({
    where: { id: sozlesme.id },
    data: { durum: "ImzalandiOnayBekliyor", imzaTarihi: new Date() },
  });

  return NextResponse.json({ ok: true });
}
