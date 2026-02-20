import { CampaignStatus, RecipientStatus, SubscriptionTokenType } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { getResend } from "@/lib/resend";
import { buildTokenExpiry, createRawToken, createShortCode, hashToken } from "@/lib/tokens";

const HREF_REGEX = /href="(https?:\/\/[^"#?][^"]*)"/g;

async function createSubscriptionToken(subscriberId: string, type: SubscriptionTokenType, ttlMinutes: number): Promise<string> {
  const rawToken = createRawToken();

  await prisma.subscriptionToken.create({
    data: {
      subscriberId,
      tokenHash: hashToken(rawToken),
      type,
      expiresAt: buildTokenExpiry(ttlMinutes)
    }
  });

  return rawToken;
}

async function upsertCampaignLink(campaignId: string, originalUrl: string): Promise<string> {
  const existing = await prisma.campaignLink.findFirst({
    where: { campaignId, originalUrl }
  });

  if (existing) {
    return existing.shortCode;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const created = await prisma.campaignLink.create({
        data: {
          campaignId,
          originalUrl,
          shortCode: createShortCode(5)
        }
      });

      return created.shortCode;
    } catch {
      // Retry on shortCode collisions.
    }
  }

  throw new Error("Could not allocate tracking short code.");
}

async function buildTrackedHtml(params: {
  campaignId: string;
  recipientId: string;
  messageId: string;
  markdownBody: string;
  preheader: string | null;
  unsubscribeUrl: string;
}): Promise<string> {
  const bodyHtml = renderMarkdownToHtml(params.markdownBody);

  let trackedBody = bodyHtml;
  const matches = [...trackedBody.matchAll(HREF_REGEX)];

  for (const match of matches) {
    const original = match[1];
    const shortCode = await upsertCampaignLink(params.campaignId, original);
    const trackedUrl = `${env.appUrl}/api/c/${shortCode}?r=${params.recipientId}`;
    trackedBody = trackedBody.replaceAll(`href="${original}"`, `href="${trackedUrl}"`);
  }

  const preheader = params.preheader ?? "Insights práticos sobre engenharia, IA e automação.";

  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;color:#f5f0e8;font-family:system-ui,-apple-system,sans-serif;">
    <span style="display:none;opacity:0;color:transparent;height:0;width:0;">${preheader}</span>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;padding:24px;">
      <tr>
        <td style="padding:8px 0 24px 0;border-bottom:1px solid #2b2b2b;">
          <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#c8ff2d;margin:0 0 8px 0;">Marlow Newsletter</p>
          <h1 style="font-size:28px;line-height:1.2;margin:0;color:#f5f0e8;">Building the future from anywhere</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 0;font-size:16px;line-height:1.7;color:#f5f0e8;">
          ${trackedBody}
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;border-top:1px solid #2b2b2b;font-size:13px;color:#a8a8a8;">
          <p style="margin:0 0 8px 0;">You are receiving this because you subscribed at newsletter.marlow.dev.br.</p>
          <p style="margin:0;"><a href="${params.unsubscribeUrl}" style="color:#c8ff2d;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
    <img src="${env.appUrl}/api/t/${params.messageId}" alt="" width="1" height="1" style="display:block;border:0;" />
  </body>
</html>`;
}

export async function sendCampaignNow(campaignId: string): Promise<{ sent: number; attempted: number }> {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const subscribers = await prisma.subscriber.findMany({
    where: {
      status: "active",
      language: campaign.language
    }
  });

  if (subscribers.length === 0) {
    return { sent: 0, attempted: 0 };
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: CampaignStatus.sending }
  });

  const resend = getResend();
  const fromAddress = env.resendFrom ?? "newsletter@marlow.dev.br";

  let sent = 0;

  for (const subscriber of subscribers) {
    try {
      const recipient = await prisma.campaignRecipient.upsert({
        where: {
          campaignId_subscriberId: {
            campaignId: campaign.id,
            subscriberId: subscriber.id
          }
        },
        update: {},
        create: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          status: RecipientStatus.queued
        }
      });

      if (recipient.status === RecipientStatus.sent) {
        continue;
      }

      const messageId = createRawToken(12);
      const unsubscribeToken = await createSubscriptionToken(subscriber.id, SubscriptionTokenType.unsubscribe, 60 * 24 * 30);
      const unsubscribeUrl = `${env.appUrl}/unsubscribe?token=${unsubscribeToken}`;

      const html = await buildTrackedHtml({
        campaignId: campaign.id,
        recipientId: recipient.id,
        messageId,
        markdownBody: campaign.markdownBody,
        preheader: campaign.preheader,
        unsubscribeUrl
      });

      await resend.emails.send({
        from: fromAddress,
        to: [subscriber.email],
        subject: campaign.subject,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
        }
      });

      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          messageId,
          status: RecipientStatus.sent,
          sentAt: new Date()
        }
      });

      await prisma.event.create({
        data: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          campaignRecipientId: recipient.id,
          type: "sent",
          metadata: {
            messageId
          }
        }
      });

      sent += 1;
    } catch (error) {
      await prisma.event.create({
        data: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          type: "bounced",
          metadata: {
            error: error instanceof Error ? error.message : "unknown"
          }
        }
      });
    }
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: sent > 0 ? CampaignStatus.sent : CampaignStatus.failed,
      sentAt: sent > 0 ? new Date() : null
    }
  });

  return {
    sent,
    attempted: subscribers.length
  };
}

export async function processDueCampaigns(): Promise<number> {
  const dueCampaigns = await prisma.campaign.findMany({
    where: {
      status: CampaignStatus.scheduled,
      scheduledAt: {
        lte: new Date()
      }
    },
    select: {
      id: true
    }
  });

  for (const campaign of dueCampaigns) {
    await sendCampaignNow(campaign.id);
  }

  return dueCampaigns.length;
}
