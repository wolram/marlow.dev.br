import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ArchivePage() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "sent",
      isPublic: true
    },
    orderBy: { sentAt: "desc" },
    take: 50
  });

  return (
    <main>
      <h1>Archive</h1>
      <div className="grid">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="card">
            <p className="small">{campaign.language}</p>
            <h2>{campaign.title}</h2>
            <p className="small">{campaign.sentAt?.toISOString().slice(0, 10)}</p>
            <Link href={`/archive/${campaign.slug}`}>Read edition</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
