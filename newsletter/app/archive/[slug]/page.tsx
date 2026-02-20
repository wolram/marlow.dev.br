import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renderMarkdownToHtml } from "@/lib/markdown";

export default async function ArchiveDetail({ params }: { params: { slug: string } }) {
  const campaign = await prisma.campaign.findUnique({ where: { slug: params.slug } });

  if (!campaign || campaign.status !== "sent" || !campaign.isPublic) {
    notFound();
  }

  const html = campaign.htmlBody ?? renderMarkdownToHtml(campaign.markdownBody);

  return (
    <main>
      <p className="badge">{campaign.language}</p>
      <h1>{campaign.title}</h1>
      <article className="card" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
