import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";

export async function GET() {
  const res = NextResponse.redirect(new URL("/giris", process.env.NEXTAUTH_URL ?? "http://localhost:3001"));
  res.cookies.delete(COOKIE);
  return res;
}
