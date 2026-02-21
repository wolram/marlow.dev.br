export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  resendFrom: process.env.RESEND_FROM ?? "newsletter@marlow.dev.br",
  resendApiKey: process.env.RESEND_API_KEY,
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET,
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "dev-secret",
  workerSecret: process.env.WORKER_SECRET
};
