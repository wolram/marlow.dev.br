import { SubscriptionTokenType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const rawToken = searchParams.token;

  if (!rawToken) {
    return (
      <main>
        <h1>Invalid unsubscribe link</h1>
      </main>
    );
  }

  const token = await prisma.subscriptionToken.findUnique({
    where: { tokenHash: hashToken(rawToken) }
  });

  if (!token || token.type !== SubscriptionTokenType.unsubscribe || token.usedAt || token.expiresAt < new Date()) {
    return (
      <main>
        <h1>Link expired or invalid</h1>
      </main>
    );
  }

  await prisma.$transaction([
    prisma.subscriptionToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() }
    }),
    prisma.subscriber.update({
      where: { id: token.subscriberId },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date()
      }
    }),
    prisma.event.create({
      data: {
        subscriberId: token.subscriberId,
        type: "unsubscribed"
      }
    })
  ]);

  return (
    <main>
      <h1>You have been unsubscribed</h1>
      <p>Thanks for reading so far.</p>
    </main>
  );
}
