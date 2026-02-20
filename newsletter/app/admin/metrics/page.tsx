import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function MetricsPage() {
  await requireAdmin();

  const [sent, opened, clicked, unsubscribed] = await Promise.all([
    prisma.event.count({ where: { type: "sent" } }),
    prisma.event.count({ where: { type: "opened" } }),
    prisma.event.count({ where: { type: "clicked" } }),
    prisma.event.count({ where: { type: "unsubscribed" } })
  ]);

  return (
    <main>
      <h1>Metrics</h1>
      <nav className="nav">
        <Link href="/admin">Dashboard</Link>
      </nav>
      <div className="grid grid-2">
        <div className="card">
          <h3>Sent</h3>
          <p>{sent}</p>
        </div>
        <div className="card">
          <h3>Opened</h3>
          <p>{opened}</p>
        </div>
        <div className="card">
          <h3>Clicked</h3>
          <p>{clicked}</p>
        </div>
        <div className="card">
          <h3>Unsubscribed</h3>
          <p>{unsubscribed}</p>
        </div>
      </div>
      <p className="small">Delivered currently mirrors provider-level success for sent messages.</p>
    </main>
  );
}
