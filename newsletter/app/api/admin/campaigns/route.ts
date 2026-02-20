import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

const payloadSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  language: z.enum(["en", "pt-BR"]),
  subject: z.string().min(1),
  preheader: z.string().optional(),
  markdownBody: z.string().min(1),
  isPublic: z.boolean().optional()
});

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, campaigns });
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    const campaign = await prisma.campaign.create({
      data: {
        title: payload.title,
        slug: payload.slug.toLowerCase(),
        language: payload.language,
        subject: payload.subject,
        preheader: payload.preheader,
        markdownBody: payload.markdownBody,
        isPublic: payload.isPublic ?? true,
        status: "draft"
      }
    });

    return NextResponse.json({ ok: true, id: campaign.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
