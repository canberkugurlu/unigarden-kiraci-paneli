import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const talepler = await prisma.bakimTalebi.findMany({
    where: { ogrenciId: session.id },
    include: { konut: { select: { daireNo: true, blok: true } } },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(talepler);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { baslik, aciklama, oncelik, kategori } = await req.json();
  if (!baslik || !aciklama) return NextResponse.json({ error: "Başlık ve açıklama zorunludur." }, { status: 400 });

  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
  });
  if (!sozlesme) return NextResponse.json({ error: "Aktif sözleşme bulunamadı." }, { status: 404 });

  const talep = await prisma.bakimTalebi.create({
    data: {
      baslik,
      aciklama,
      oncelik: oncelik ?? "Normal",
      kategori: kategori ?? "Diger",
      ogrenciId: session.id,
      konutId: sozlesme.konutId,
    },
  });
  return NextResponse.json(talep, { status: 201 });
}
