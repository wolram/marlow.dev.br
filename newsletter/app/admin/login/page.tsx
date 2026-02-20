"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  return (
    <main>
      <h1>Admin login</h1>
      <div className="card">
        <form
          className="grid"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setMessage("");

            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "");

            const response = await fetch("/api/admin/auth/request", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email })
            });

            if (response.ok) {
              setMessage("Check your inbox for the magic link.");
            } else {
              setMessage("Could not send magic link.");
            }

            setLoading(false);
          }}
        >
          <div>
            <label htmlFor="email">Admin email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <button disabled={loading} type="submit">
            {loading ? "Sending..." : "Send magic link"}
          </button>
          {message ? <p className="small">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
