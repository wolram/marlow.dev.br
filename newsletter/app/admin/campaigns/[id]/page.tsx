import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { CampaignDetailClient } from "./campaign-detail-client";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { recipients: true }
  });

  if (!campaign) {
    notFound();
  }

  const html = campaign.htmlBody ?? renderMarkdownToHtml(campaign.markdownBody);

  return (
    <main>
      <p><Link href="/admin/campaigns">Back to campaigns</Link></p>
      <h1>{campaign.title}</h1>
      <p>Status: {campaign.status}</p>
      <p>Language: {campaign.language}</p>
      <p>Recipients: {campaign.recipients.length}</p>
      <CampaignDetailClient campaignId={campaign.id} />

      <section className="card">
        <h2>Subject</h2>
        <p>{campaign.subject}</p>
        <h2>Preview</h2>
        <article className="preview" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}
