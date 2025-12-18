"use client";
import { useState } from "react";

export default function FeedbackForm({ queue, mrn }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submitFeedback = async () => {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue,
        mrn,
        message,
      }),
    });

    setSent(true);
    setMessage("");
  };

  if (sent) {
    return <p>✅ Terima kasih atas feedback Anda</p>;
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Feedback Pelayanan</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "10px" }}
        placeholder="Tulis kritik atau saran..."
      />
      <button onClick={submitFeedback} style={{ marginTop: "10px" }}>
        Kirim Feedback
      </button>
    </div>
  );
}
