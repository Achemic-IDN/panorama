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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "800px",
        margin: "auto",
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Dashboard Pasien</h1>

        <section style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#555", marginBottom: "20px" }}>Feedback Pelayanan</h3>

          {sent && <p style={{
            color: "green",
            background: "#d4edda",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px"
          }}>✔ Feedback terkirim</p>}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis kritik atau saran..."
            style={{
              width: "100%",
              height: "100px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px",
              boxSizing: "border-box",
              marginBottom: "15px"
            }}
          />

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>Rating: </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px"
              }}
            >
              <option value={1}>⭐ 1 Bintang</option>
              <option value={2}>⭐⭐ 2 Bintang</option>
              <option value={3}>⭐⭐⭐ 3 Bintang</option>
              <option value={4}>⭐⭐⭐⭐ 4 Bintang</option>
              <option value={5}>⭐⭐⭐⭐⭐ 5 Bintang</option>
            </select>
          </div>

          <button
            onClick={submitFeedback}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            Kirim Feedback
          </button>
        </section>
      </main>
    </div>
  );
}
