import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PIXEL_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export async function GET(_: Request, { params }: { params: { messageId: string } }) {
  const recipient = await prisma.campaignRecipient.findUnique({
    where: { messageId: params.messageId }
  });

  if (recipient) {
    await prisma.$transaction([
      prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: recipient.status === "clicked" ? "clicked" : "opened",
          openedAt: recipient.openedAt ?? new Date()
        }
      }),
      prisma.event.create({
        data: {
          campaignId: recipient.campaignId,
          subscriberId: recipient.subscriberId,
          campaignRecipientId: recipient.id,
          type: "opened"
        }
      })
    ]);
  }

  const pixel = Buffer.from(PIXEL_GIF_BASE64, "base64");

  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
