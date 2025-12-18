"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history
    fetch("/api/queue?mrn=999999")
      .then(res => res.json())
      .then(setHistory)
      .catch(err => console.error("Error loading history:", err));
  }, []);

  async function submitFeedback() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queue: "ABC123",
          mrn: "999999",
          message,
          rating,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      setSent(true);
      setMessage("");
      setRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queue: "ABC123",
          mrn: "999999",
          message,
          rating,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      setSent(true);
      setMessage("");
      setRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#555", marginBottom: "20px" }}>Informasi Pasien</h3>
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
              <p><strong>Nomor Antrean:</strong> ABC123</p>
              <p><strong>Nomor MRN:</strong> 999999</p>
              <p><strong>Status:</strong> Menunggu</p>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#555", marginBottom: "20px" }}>Feedback Pelayanan</h3>

            {sent && <p style={{
              color: "green",
              background: "#d4edda",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px"
            }}>✔ Feedback terkirim</p>}

            {error && <p style={{
              color: "red",
              background: "#f8d7da",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px"
            }}>Error: {error}</p>}

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
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => { if (!loading) e.target.style.transform = "scale(1.05)"; }}
              onMouseOut={(e) => { if (!loading) e.target.style.transform = "scale(1)"; }}
            >
              {loading ? "Mengirim..." : "Kirim Feedback"}
            </button>
          </div>
        </div>

        {/* Riwayat Antrean */}
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#555", marginBottom: "20px" }}>Riwayat Antrean</h3>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "5px",
            overflow: "hidden"
          }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Antrean</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.queue}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{h.status}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(h.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
