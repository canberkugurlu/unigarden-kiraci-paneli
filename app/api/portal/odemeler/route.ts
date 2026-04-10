import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sozlesmeler = await prisma.sozlesme.findMany({ where: { ogrenciId: session.id } });
  const sozlesmeIds = sozlesmeler.map(s => s.id);

  const odemeler = await prisma.odeme.findMany({
    where: { sozlesmeId: { in: sozlesmeIds } },
    include: { sozlesme: { select: { sozlesmeNo: true } } },
    orderBy: { odenmeTarihi: "desc" },
  });
  return NextResponse.json(odemeler);
}
