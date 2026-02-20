import { SubscriptionTokenType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export default async function ConfirmPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const rawToken = searchParams.token;

  if (!rawToken) {
    return (
      <main>
        <h1>Invalid confirmation link</h1>
      </main>
    );
  }

  const tokenHash = hashToken(rawToken);
  const token = await prisma.subscriptionToken.findUnique({
    where: { tokenHash },
    include: { subscriber: true }
  });

  if (!token || token.type !== SubscriptionTokenType.confirm || token.usedAt || token.expiresAt < new Date()) {
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
        status: "active",
        confirmedAt: new Date()
      }
    })
  ]);

  return (
    <main>
      <h1>Subscription confirmed</h1>
      <p>You are now subscribed to the newsletter.</p>
    </main>
  );
}
