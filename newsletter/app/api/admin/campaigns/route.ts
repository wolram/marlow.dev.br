import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subject: z.string().min(1),
  language: z.enum(["en", "pt-BR"]),
  markdownBody: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const campaign = await prisma.campaign.create({
      data: {
        ...payload,
        slug: payload.slug.toLowerCase(),
        status: "draft"
      }
    });
    return NextResponse.json({ ok: true, id: campaign.id });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid" }, { status: 400 });
  }
}
