import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { eventToRecipientStatus, resendTypeToEvent } from "@/lib/webhook";

function getHeader(headers: Headers, name: string): string {
  return headers.get(name) ?? "";
}

export async function POST(request: Request) {
  const raw = await request.text();

  if (env.resendWebhookSecret) {
    try {
      const wh = new Webhook(env.resendWebhookSecret);
      wh.verify(raw, {
        "svix-id": getHeader(request.headers, "svix-id"),
        "svix-signature": getHeader(request.headers, "svix-signature"),
        "svix-timestamp": getHeader(request.headers, "svix-timestamp")
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(raw) as {
    type: string;
    data?: {
      email_id?: string;
      to?: string[];
      from?: string;
      subject?: string;
      click?: { link?: string };
    };
  };

  const eventType = resendTypeToEvent(payload.type);
  if (!eventType) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const messageId = payload.data?.email_id;
  if (!messageId) {
    return NextResponse.json({ ok: true, skipped: true, reason: "missing email_id" });
  }

  const recipient = await prisma.campaignRecipient.findUnique({ where: { messageId } });
  if (!recipient) {
    return NextResponse.json({ ok: true, skipped: true, reason: "recipient not found" });
  }

  const status = eventToRecipientStatus(eventType);
  const now = new Date();

  await prisma.$transaction([
    prisma.campaignRecipient.update({
      where: { id: recipient.id },
      data: {
        status,
        deliveredAt: eventType === "delivered" ? now : recipient.deliveredAt,
        openedAt: eventType === "opened" ? now : recipient.openedAt,
        clickedAt: eventType === "clicked" ? now : recipient.clickedAt
      }
    }),
    prisma.event.create({
      data: {
        campaignId: recipient.campaignId,
        campaignRecipientId: recipient.id,
        type: eventType,
        metadata: payload
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
