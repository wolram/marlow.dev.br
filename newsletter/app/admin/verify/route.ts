import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", env.appUrl));
  }

  const found = await prisma.adminLoginToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!found || found.expiresAt < new Date() || found.usedAt || found.email !== env.adminEmail) {
    return NextResponse.redirect(new URL("/admin/login", env.appUrl));
  }

  await prisma.adminLoginToken.update({
    where: { id: found.id },
    data: { usedAt: new Date() }
  });

  const sessionToken = await createAdminSession(found.email);
  const response = NextResponse.redirect(new URL("/admin", env.appUrl));
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });

  return response;
}
