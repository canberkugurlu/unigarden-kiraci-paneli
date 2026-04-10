import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  // Get tenant's etap from active contract
  const sozlesme = await prisma.sozlesme.findFirst({
    where: { ogrenciId: session.id, durum: "Aktif" },
    include: { konut: { select: { etap: true } } },
  });
  const etap = sozlesme?.konut.etap;

  const duyurular = await prisma.duyuru.findMany({
    where: {
      yayinda: true,
      OR: [
        { hedef: "Tumu" },
        ...(etap ? [{ hedef: `Etap${etap}` }] : []),
        { hedef: { contains: session.id } },
      ],
    },
    orderBy: { tarih: "desc" },
  });
  return NextResponse.json(duyurular);
}
