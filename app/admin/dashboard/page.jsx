"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        // Load feedbacks and queues
        const [feedbackRes, queueRes] = await Promise.all([
          fetch("/api/admin/feedback"),
          fetch("/api/admin/queue")
        ]);
        if (!feedbackRes.ok || !queueRes.ok) {
          throw new Error("Failed to fetch data");
        }
        const feedbackData = await feedbackRes.json();
        const queueData = await queueRes.json();
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
        setQueues(Array.isArray(queueData) ? queueData : []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const updateQueueStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedQueue = await res.json();
        setQueues(queues.map(q => q.id === id ? updatedQueue : q));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const [newQueue, setNewQueue] = useState("");
  const [newMrn, setNewMrn] = useState("");

  const createQueue = async () => {
    if (!newQueue || !newMrn) return;
    try {
      const res = await fetch("/api/admin/queue", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: newQueue, mrn: newMrn }),
      });
      if (res.ok) {
        const q = await res.json();
        setQueues([...queues, q]);
        setNewQueue("");
        setNewMrn("");
      }
    } catch (error) {
      console.error("Error creating queue:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
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

        {/* Statistik */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", flex: 1, minWidth: "150px", textAlign: "center" }}>
            <h3>Total Antrean</h3>
            <p style={{ fontSize: "24px", color: "#3685fc" }}>{stats.total}</p>
          </div>
          <div style={{ background: "#fff3cd", padding: "20px", borderRadius: "8px", flex: 1, minWidth: "150px", textAlign: "center" }}>
            <h3>Menunggu</h3>
            <p style={{ fontSize: "24px", color: "#856404" }}>{stats.waiting}</p>
          </div>
          <div style={{ background: "#d1ecf1", padding: "20px", borderRadius: "8px", flex: 1, minWidth: "150px", textAlign: "center" }}>
            <h3>Dipanggil</h3>
            <p style={{ fontSize: "24px", color: "#0c5460" }}>{stats.called}</p>
          </div>
          <div style={{ background: "#d4edda", padding: "20px", borderRadius: "8px", flex: 1, minWidth: "150px", textAlign: "center" }}>
            <h3>Selesai</h3>
            <p style={{ fontSize: "24px", color: "#155724" }}>{stats.completed}</p>
          </div>
        </div>

        {/* Form Tambah Antrean */}
        <div style={{ marginBottom: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Tambah Antrean Baru</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Nomor Antrean (e.g. ABC123)"
              value={newQueue}
              onChange={(e) => setNewQueue(e.target.value)}
              style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1, minWidth: "150px" }}
            />
            <input
              type="text"
              placeholder="MRN"
              value={newMrn}
              onChange={(e) => setNewMrn(e.target.value)}
              style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1, minWidth: "150px" }}
            />
            <button
              onClick={createQueue}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Tabel Antrean */}
        <h2 style={{ marginBottom: "20px" }}>Daftar Antrean</h2>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "40px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          borderRadius: "5px",
          overflow: "hidden"
        }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Antrean</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>MRN</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Waktu Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((q, i) => (
              <tr key={q.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{q.queue}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{q.mrn}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <select
                    value={q.status}
                    onChange={(e) => updateQueueStatus(q.id, e.target.value)}
                    style={{ padding: "5px", border: "1px solid #ddd", borderRadius: "4px" }}
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Dipanggil">Dipanggil</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(q.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tabel Feedback */}
        <h2 style={{ marginBottom: "20px" }}>Feedback Pasien</h2>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "40px",
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
              <tr key={f.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
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
