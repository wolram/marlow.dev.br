import { requireAdmin } from "@/lib/auth";
import { NewCampaignForm } from "./new-campaign-form";

export default async function NewCampaignPage() {
  await requireAdmin();

  return (
    <main>
      <h1>New campaign</h1>
      <a href="/admin">Back to dashboard</a>
      <NewCampaignForm />
    </main>
  );
}
