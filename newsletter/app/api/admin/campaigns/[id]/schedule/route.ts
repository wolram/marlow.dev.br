import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

const payloadSchema = z.object({
  scheduledAt: z.string().datetime()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: "scheduled",
        scheduledAt: new Date(payload.scheduledAt)
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
