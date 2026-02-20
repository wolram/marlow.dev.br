import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const url = new URL(request.url);
  const recipientId = url.searchParams.get("r");

  const link = await prisma.campaignLink.findUnique({ where: { shortCode: params.shortCode } });

  if (!link) {
    return NextResponse.redirect("https://newsletter.marlow.dev.br");
  }

  await prisma.campaignLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } }
  });

  if (recipientId) {
    const recipient = await prisma.campaignRecipient.findUnique({ where: { id: recipientId } });

    if (recipient) {
      await prisma.$transaction([
        prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: "clicked",
            clickedAt: recipient.clickedAt ?? new Date(),
            openedAt: recipient.openedAt ?? new Date()
          }
        }),
        prisma.event.create({
          data: {
            campaignId: recipient.campaignId,
            subscriberId: recipient.subscriberId,
            campaignRecipientId: recipient.id,
            type: "clicked",
            metadata: {
              shortCode: params.shortCode,
              originalUrl: link.originalUrl
            }
          }
        })
      ]);
    }
  }

  return NextResponse.redirect(link.originalUrl);
}
