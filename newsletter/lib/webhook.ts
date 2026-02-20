import { EventType, RecipientStatus } from "@prisma/client";

export function resendTypeToEvent(type: string): EventType | null {
  if (type === "email.delivered") return "delivered";
  if (type === "email.opened") return "opened";
  if (type === "email.clicked") return "clicked";
  if (type === "email.bounced") return "bounced";
  if (type === "email.complained") return "complained";
  return null;
}

export function eventToRecipientStatus(type: EventType): RecipientStatus {
  if (type === "clicked") return "clicked";
  if (type === "opened") return "opened";
  if (type === "delivered") return "delivered";
  if (type === "bounced") return "bounced";
  if (type === "complained") return "complained";
  return "sent";
}
