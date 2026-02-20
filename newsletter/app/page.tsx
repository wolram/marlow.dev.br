import Link from "next/link";
import { SubscribeForm } from "./subscribe-form";

export default function HomePage() {
  return (
    <main>
      <p className="badge">Marlow Newsletter</p>
      <h1>Building the future from anywhere</h1>
      <p>
        Insights práticos sobre software engineering, IA aplicada e automação com foco em execução.
      </p>

      <section className="card" style={{ marginTop: "1.5rem" }}>
        <h2>Join the newsletter</h2>
        <p className="small">Double opt-in enabled. No spam.</p>
        <SubscribeForm />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Archive</h2>
        <p className="small">
          Read public editions at <Link href="/archive">/archive</Link>
        </p>
      </section>
    </main>
  );
}
