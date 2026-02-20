import crypto from "node:crypto";

export function createRawToken(size = 32): string {
  return crypto.randomBytes(size).toString("hex");
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function buildTokenExpiry(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function createShortCode(size = 6): string {
  return crypto.randomBytes(size).toString("base64url");
}
