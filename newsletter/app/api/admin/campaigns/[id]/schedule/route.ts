import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  scheduledAt: z.string().datetime()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = schema.parse(await request.json());
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: "scheduled", scheduledAt: new Date(payload.scheduledAt) }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "schedule failed" }, { status: 400 });
  }
}
