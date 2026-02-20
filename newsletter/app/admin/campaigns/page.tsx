import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CampaignActions } from "./campaign-actions";

export default async function CampaignsPage() {
  await requireAdmin();

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main>
      <h1>Campaigns</h1>
      <nav className="nav">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/campaigns/new">New campaign</Link>
      </nav>

      <div className="grid">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="card">
            <p className="small">{campaign.language}</p>
            <h3>{campaign.title}</h3>
            <p className="small">Status: {campaign.status}</p>
            <p className="small">Slug: {campaign.slug}</p>
            <CampaignActions campaignId={campaign.id} />
          </article>
        ))}
      </div>
    </main>
  );
}
