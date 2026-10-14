import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const rawSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && !rawSecret) {
  console.error("FATAL SECURITY WARNING: JWT_SECRET environment variable is missing in production!");
}

const JWT_SECRET = new TextEncoder().encode(
  rawSecret || "fallback_secret_for_development_only"
);

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized: Administrator session required.");
  }
  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
