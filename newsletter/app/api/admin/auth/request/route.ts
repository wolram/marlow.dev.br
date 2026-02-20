import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { buildTokenExpiry, createRawToken, hashToken } from "@/lib/tokens";

const payloadSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const { email } = payloadSchema.parse(await request.json());
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== env.adminEmail.toLowerCase()) {
      return NextResponse.json({ ok: true });
    }

    const rawToken = createRawToken();

    await prisma.adminLoginToken.create({
      data: {
        email: normalizedEmail,
        tokenHash: hashToken(rawToken),
        expiresAt: buildTokenExpiry(15)
      }
    });

    const loginUrl = `${env.appUrl}/admin/verify?token=${rawToken}`;

    const resend = getResend();
    await resend.emails.send({
      from: env.resendFrom ?? "newsletter@marlow.dev.br",
      to: [normalizedEmail],
      subject: "Your admin magic link",
      html: `<p>Sign in to newsletter admin:</p><p><a href="${loginUrl}">${loginUrl}</a></p>`
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
