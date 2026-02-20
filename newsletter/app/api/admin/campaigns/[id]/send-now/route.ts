import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { sendCampaignNow } from "@/lib/campaigns";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await sendCampaignNow(params.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "send failed" },
      { status: 400 }
    );
  }
}
