import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
    include: { konut: true, odemeler: { orderBy: { odenmeTarihi: "desc" }, take: 3 } },
  });
  return NextResponse.json(sozlesme);
}
