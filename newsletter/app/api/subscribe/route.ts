import { SubscriptionTokenType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getResend } from "@/lib/resend";
import { buildTokenExpiry, createRawToken, hashToken } from "@/lib/tokens";

const payloadSchema = z.object({
  email: z.string().email(),
  language: z.enum(["en", "pt-BR"]),
  source: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    const normalizedEmail = payload.email.trim().toLowerCase();

    const subscriber = await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        language: payload.language,
        source: payload.source ?? "landing",
        status: "pending"
      },
      create: {
        email: normalizedEmail,
        language: payload.language,
        source: payload.source ?? "landing",
        status: "pending"
      }
    });

    const rawToken = createRawToken();

    await prisma.subscriptionToken.create({
      data: {
        subscriberId: subscriber.id,
        tokenHash: hashToken(rawToken),
        type: SubscriptionTokenType.confirm,
        expiresAt: buildTokenExpiry(60 * 24)
      }
    });

    const confirmUrl = `${env.appUrl}/confirm?token=${rawToken}`;
    const resend = getResend();

    await resend.emails.send({
      from: env.resendFrom ?? "newsletter@marlow.dev.br",
      to: [normalizedEmail],
      subject: payload.language === "pt-BR" ? "Confirme sua inscrição" : "Confirm your subscription",
      html:
        payload.language === "pt-BR"
          ? `<p>Confirme sua inscrição clicando no link:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`
          : `<p>Confirm your newsletter subscription:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
