export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM ?? "newsletter@marlow.dev.br",
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET
};
