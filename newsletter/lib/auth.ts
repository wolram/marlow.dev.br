import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { createRawToken } from "@/lib/tokens";

const COOKIE_NAME = "admin_session";

function sign(value: string): string {
  return crypto.createHmac("sha256", env.adminSessionSecret).update(value).digest("hex");
}

export async function createAdminSession(email: string): Promise<string> {
  const raw = createRawToken();
  const signature = sign(raw);
  const tokenHash = crypto.createHash("sha256").update(`${raw}.${signature}`).digest("hex");

  await prisma.adminSession.create({
    data: {
      email,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  return `${raw}.${signature}`;
}

export async function setAdminCookie(token: string): Promise<void> {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });
}

export async function clearAdminCookie(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export async function getAdminFromCookie(): Promise<string | null> {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  const [raw, signature] = cookie.split(".");
  if (!raw || !signature) return null;
  if (sign(raw) !== signature) return null;

  const tokenHash = crypto.createHash("sha256").update(cookie).digest("hex");

  const session = await prisma.adminSession.findUnique({ where: { tokenHash } });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.email;
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdminFromCookie();
  if (!email) {
    redirect("/admin/login");
  }
  return email;
}
