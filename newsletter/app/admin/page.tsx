import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  await requireAdmin();

  const [subscribers, campaigns] = await Promise.all([
    prisma.subscriber.count({ where: { status: "active" } }),
    prisma.campaign.count()
  ]);

  return (
    <main>
      <h1>Admin</h1>
      <nav className="nav">
        <Link href="/admin/campaigns">Campaigns</Link>
        <Link href="/admin/campaigns/new">New campaign</Link>
        <Link href="/admin/subscribers">Subscribers</Link>
        <Link href="/admin/metrics">Metrics</Link>
      </nav>

      <div className="grid grid-2">
        <div className="card">
          <h3>Active subscribers</h3>
          <p>{subscribers}</p>
        </div>
        <div className="card">
          <h3>Total campaigns</h3>
          <p>{campaigns}</p>
        </div>
      </div>
    </main>
  );
}
