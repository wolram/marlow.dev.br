import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { processDueCampaigns } from "@/lib/campaigns";

export async function POST(request: Request) {
  const key = request.headers.get("x-worker-secret");

  if (!env.workerSecret || key !== env.workerSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const processed = await processDueCampaigns();
  return NextResponse.json({ ok: true, processed });
}
