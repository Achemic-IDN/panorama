"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (data.role !== "admin") {
        router.push("/admin/login");
        return;
      }
      // If admin, load feedbacks
      const feedbackRes = await fetch("/api/admin/feedback");
      const feedbackData = await feedbackRes.json();
      setFeedbacks(feedbackData);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "1200px",
        margin: "auto",
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Dashboard Admin Panorama</h1>

        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          borderRadius: "5px",
          overflow: "hidden"
        }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Antrean</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>MRN</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Pesan</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Rating</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{f.queue}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{f.mrn}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{f.message}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{'⭐'.repeat(f.rating)} ({f.rating})</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(f.time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
