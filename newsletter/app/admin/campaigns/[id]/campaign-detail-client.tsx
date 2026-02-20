"use client";

import { useState } from "react";

export function CampaignDetailClient({ campaignId }: { campaignId: string }) {
  const [status, setStatus] = useState("");

  async function sendNow() {
    setStatus("Sending...");
    const response = await fetch(`/api/admin/campaigns/${campaignId}/send-now`, { method: "POST" });
    if (!response.ok) {
      setStatus("Send failed");
      return;
    }
    const data = await response.json();
    setStatus(`Sent ${data.sent}/${data.attempted}`);
  }

  async function schedule() {
    setStatus("Scheduling...");
    const scheduledAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const response = await fetch(`/api/admin/campaigns/${campaignId}/schedule`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scheduledAt })
    });
    if (!response.ok) {
      setStatus("Schedule failed");
      return;
    }
    setStatus("Scheduled for +10 minutes");
  }

  return (
    <div className="actions">
      <button type="button" onClick={sendNow}>Send now</button>
      <button type="button" onClick={schedule}>Schedule +10m</button>
      {status ? <span>{status}</span> : null}
    </div>
  );
}
