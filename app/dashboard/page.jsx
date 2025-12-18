"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);

  async function submitFeedback() {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue: "ABC123",
        mrn: "999999",
        message,
        rating,
      }),
    });

    setSent(true);
    setMessage("");
    setRating(5);
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Pasien</h1>

      <section style={{ marginTop: "30px" }}>
        <h3>Feedback Pelayanan</h3>

        {sent && <p style={{ color: "green" }}>✔ Feedback terkirim</p>}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis kritik atau saran..."
          style={{ width: "100%", height: "100px" }}
        />

        <div style={{ marginTop: "10px" }}>
          <label>Rating: </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ padding: "5px" }}
          >
            <option value={1}>1 Bintang</option>
            <option value={2}>2 Bintang</option>
            <option value={3}>3 Bintang</option>
            <option value={4}>4 Bintang</option>
            <option value={5}>5 Bintang</option>
          </select>
        </div>

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
