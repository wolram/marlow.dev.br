"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export function SubscribeForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(formData: FormData) {
    setState("loading");
    setMessage("");

    try {
      const payload = {
        email: String(formData.get("email") ?? ""),
        language: String(formData.get("language") ?? "en"),
        source: "newsletter_landing"
      };

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Could not subscribe.");
      }

      setState("success");
      setMessage("Check your inbox to confirm your subscription.");
    } catch {
      setState("error");
      setMessage("Failed to subscribe. Please try again.");
    }
  }

  return (
    <form
      className="grid"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await onSubmit(formData);
      }}
    >
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@email.com" />
      </div>

      <div>
        <label htmlFor="language">Language</label>
        <select id="language" name="language" defaultValue="en">
          <option value="en">English</option>
          <option value="pt-BR">Português (Brasil)</option>
        </select>
      </div>

      <button type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {message ? <p className="small">{message}</p> : null}
    </form>
  );
}
