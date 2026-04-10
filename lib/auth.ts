import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "unigarden-kiraci-jwt-gizli-2024"
);
const COOKIE = "kiraci_token";

export interface KiraciPayload {
  id: string;
  ad: string;
  soyad: string;
  email: string;
}

export async function signToken(payload: KiraciPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<KiraciPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as KiraciPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<KiraciPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE };
