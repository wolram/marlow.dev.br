import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }

  return resendClient;
}
