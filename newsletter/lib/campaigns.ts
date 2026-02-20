import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { Resend } from "resend";

export async function sendCampaignNow(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { recipients: true }
  });

  if (!campaign) throw new Error("Campaign not found");
  if (!env.resendApiKey) throw new Error("RESEND_API_KEY missing");

  const resend = new Resend(env.resendApiKey);
  const htmlBody = campaign.htmlBody ?? renderMarkdownToHtml(campaign.markdownBody);

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: CampaignStatus.sending }
  });

  let sent = 0;

  for (const recipient of campaign.recipients) {
    if (recipient.status === "sent") continue;

    const email = await resend.emails.send({
      from: env.resendFrom,
      to: [recipient.email],
      subject: campaign.subject,
      html: `
      <h1 style="font-family:system-ui">Building the future from anywhere</h1>
      ${htmlBody}`
    });

    await prisma.campaignRecipient.update({
      where: { id: recipient.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        messageId: email.data?.id ?? null
      }
    });

    await prisma.event.create({
      data: {
        campaignId: campaign.id,
        campaignRecipientId: recipient.id,
        type: "sent",
        metadata: { providerMessageId: email.data?.id ?? null }
      }
    });

    sent += 1;
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: sent > 0 ? CampaignStatus.sent : CampaignStatus.failed,
      sentAt: sent > 0 ? new Date() : null
    }
  });

  return { sent, attempted: campaign.recipients.length };
}
