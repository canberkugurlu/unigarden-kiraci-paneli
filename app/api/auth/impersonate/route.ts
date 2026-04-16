import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE } from "@/lib/auth";
import { verifyImpersonationToken } from "@/lib/impersonate";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token eksik" }, { status: 400 });

  const p = await verifyImpersonationToken(token);
  if (!p) return NextResponse.json({ error: "Geçersiz/eski token" }, { status: 401 });
  if (p.targetPanel !== "kiraci") return NextResponse.json({ error: "Token bu panel için değil" }, { status: 400 });

  const ogrenci = await prisma.ogrenci.findUnique({ where: { id: p.targetUserId } });
  if (!ogrenci) return NextResponse.json({ error: "Kiracı bulunamadı" }, { status: 404 });

  const authToken = await signToken({
    id: ogrenci.id, ad: ogrenci.ad, soyad: ogrenci.soyad, email: ogrenci.email ?? "",
    rol: (ogrenci as unknown as { rol?: string }).rol ?? "Aktif",
  });

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(COOKIE, authToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return res;
}
