import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default async function SubscribersPage() {
  await requireAdmin();

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <main>
      <h1>Subscribers</h1>
      <nav className="nav">
        <Link href="/admin">Dashboard</Link>
      </nav>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Language</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td>{subscriber.email}</td>
                <td>{subscriber.language}</td>
                <td>{subscriber.status}</td>
                <td>{subscriber.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
