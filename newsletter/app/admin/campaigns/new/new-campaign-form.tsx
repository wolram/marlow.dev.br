"use client";

import { useState } from "react";

export function NewCampaignForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="grid"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");

        const formData = new FormData(event.currentTarget);
        const payload = {
          title: String(formData.get("title") ?? ""),
          slug: String(formData.get("slug") ?? ""),
          language: String(formData.get("language") ?? "en"),
          subject: String(formData.get("subject") ?? ""),
          preheader: String(formData.get("preheader") ?? ""),
          markdownBody: String(formData.get("markdownBody") ?? ""),
          isPublic: formData.get("isPublic") === "on"
        };

        const response = await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          setMessage("Failed to create campaign.");
          return;
        }

        const data = await response.json();
        setMessage(`Campaign created: ${data.id}`);
      }}
    >
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
      </div>

      <div>
        <label htmlFor="slug">Slug</label>
        <input id="slug" name="slug" placeholder="edition-001" required />
      </div>

      <div>
        <label htmlFor="language">Language</label>
        <select id="language" name="language" defaultValue="en">
          <option value="en">English</option>
          <option value="pt-BR">Português (Brasil)</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" required />
      </div>

      <div>
        <label htmlFor="preheader">Preheader</label>
        <input id="preheader" name="preheader" />
      </div>

      <div>
        <label htmlFor="markdownBody">Markdown body</label>
        <textarea id="markdownBody" name="markdownBody" required />
      </div>

      <div>
        <label htmlFor="isPublic">Public archive</label>
        <input id="isPublic" name="isPublic" type="checkbox" defaultChecked style={{ width: "auto" }} />
      </div>

      <button type="submit">Create campaign</button>

      {message ? <p className="small">{message}</p> : null}
    </form>
  );
}
