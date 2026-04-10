import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    // Kiracının aktif sözleşmesinden konutu bul
    const soz = await prisma.sozlesme.findFirst({
      where: { ogrenciId: session.id, durum: "Aktif" },
      select: { konutId: true, aylikKira: true, kisiSayisi: true, konut: { select: { etap: true, daireNo: true, tip: true } } },
    });

    if (!soz || soz.konut.etap !== 1) return NextResponse.json({ etap1: false });

    const faturalar = await prisma.etapFatura.findMany({
      where: { konutId: soz.konutId },
      orderBy: [{ yil: "desc" }, { ay: "desc" }],
    });

    return NextResponse.json({ etap1: true, konut: soz.konut, brutKira: soz.aylikKira, kisiSayisi: soz.kisiSayisi, faturalar });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}
