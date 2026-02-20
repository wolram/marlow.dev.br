import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, now });
  } catch {
    return NextResponse.json({ ok: false, now }, { status: 500 });
  }
}
