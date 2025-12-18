"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submitFeedback() {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue: "ABC123",
        mrn: "999999",
        message,
      }),
    });

    setSent(true);
    setMessage("");
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Pasien</h1>

      <section style={{ marginTop: "30px" }}>
        <h3>Feedback Pelayanan</h3>

        {sent && (
          <p style={{ color: "green" }}>
            ✅ Feedback terkirim
          </p>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis feedback Anda..."
          style={{ width: "100%", height: "100px" }}
        />

        <button
          onClick={submitFeedback}
          style={{ marginTop: "10px", padding: "8px 16px" }}
        >
          Kirim Feedback
        </button>
      </section>
    </main>
  );
}
