import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main>
      <h1>Campaigns</h1>
      <p><Link href="/">Home</Link></p>
      {campaigns.map((campaign) => (
        <article key={campaign.id} className="card">
          <h3>{campaign.title}</h3>
          <p>Status: {campaign.status}</p>
          <p>Slug: {campaign.slug}</p>
          <Link href={`/admin/campaigns/${campaign.id}`}>Open details</Link>
        </article>
      ))}
    </main>
  );
}
