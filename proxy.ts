import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-kiraci-jwt-gizli-2024"
);

function girisUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/giris";
  return url;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths
  if (pathname.startsWith("/giris") || pathname.startsWith("/api/auth") || pathname === "/") {
    return NextResponse.next();
  }

  const token = req.cookies.get("kiraci_token")?.value;
  if (!token) {
    return NextResponse.redirect(girisUrl(req));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(girisUrl(req));
    res.cookies.delete("kiraci_token");
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/(.*)", "/api/portal/(.*)"],
};
