import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-kiraci-jwt-gizli-2024"
);

function redirect(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/giris") ||
    pathname.startsWith("/kayit") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/kayit") ||
    pathname === "/";

  if (isPublic) return NextResponse.next();

  const token = req.cookies.get("kiraci_token")?.value;
  if (!token) return redirect(req, "/giris");

  let payload: { rol?: string } = {};
  try {
    const { payload: p } = await jwtVerify(token, SECRET);
    payload = p as { rol?: string };
  } catch {
    const res = redirect(req, "/giris");
    res.cookies.delete("kiraci_token");
    return res;
  }

  const rol = payload.rol ?? "Aktif";

  // Potansiyel: sadece dashboard ve sozlesme sayfası
  if (rol === "Potansiyel") {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/api/portal/sozlesme") ||
      pathname.startsWith("/api/portal/durum")
    ) {
      return NextResponse.next();
    }
    return redirect(req, "/dashboard/sozlesme");
  }

  // Pasif: dashboard, sozlesme, bakim ve ilgili API'ler
  if (rol === "Pasif") {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/sozlesme-imza") ||
      pathname.startsWith("/api/portal/sozlesme") ||
      pathname.startsWith("/api/portal/durum") ||
      pathname.startsWith("/api/bakim")
    ) {
      return NextResponse.next();
    }
    return redirect(req, "/dashboard/sozlesme");
  }

  // Aktif: her şeye erişim
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$).*)"],
};
