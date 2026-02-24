"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [queues, setQueues] = useState([]);
  const [patientLogins, setPatientLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingQueueId, setUpdatingQueueId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        // Load feedbacks, queues, and patient logins
        const feedbackRes = await fetch("/api/admin/feedback");
        const queueRes = await fetch("/api/admin/queue");
        const patientLoginRes = await fetch("/api/admin/patient-login");

        let feedbackData = [];
        let queueData = [];
        let patientLoginData = [];

        if (feedbackRes.ok) {
          const data = await feedbackRes.json();
          feedbackData = Array.isArray(data) ? data : [];
        } else {
          console.error("Failed to fetch feedbacks");
        }

        if (queueRes.ok) {
          const data = await queueRes.json();
          queueData = Array.isArray(data) ? data : [];
        } else {
          console.error("Failed to fetch queues");
        }

        if (patientLoginRes.ok) {
          const data = await patientLoginRes.json();
          patientLoginData = Array.isArray(data) ? data : [];
        } else {
          console.error("Failed to fetch patient logins");
        }

        setFeedbacks(feedbackData);
        setQueues(queueData);
        setPatientLogins(patientLoginData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const updateQueueStatus = async (id, status) => {
    setUpdatingQueueId(id);
    setUpdatingStatus(status);
    try {
      const res = await fetch(`/api/admin/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.error("Failed to update queue status");
        return;
      }
      const updatedQueue = await res.json();
      setQueues(prevQueues =>
        prevQueues.map(q => q.id === id ? updatedQueue : q)
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingQueueId(null);
      setUpdatingStatus(null);
    }
  };

  const [newQueue, setNewQueue] = useState("");
  const [newMrn, setNewMrn] = useState("");
  const [newPatientQueue, setNewPatientQueue] = useState("");
  const [newPatientMrn, setNewPatientMrn] = useState("");

  // Calculate stats from queues
  const stats = {
    total: queues.length,
    waiting: queues.filter(q => q.status === "Menunggu").length,
    called: queues.filter(q => q.status === "Dipanggil").length,
    completed: queues.filter(q => q.status === "Selesai").length,
  };

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

  const createPatientLogin = async () => {
    if (!newPatientQueue || !newPatientMrn) return;
    // Validate MRN - only numbers, max 8 characters
    if (!/^[0-9]+$/.test(newPatientMrn) || newPatientMrn.length > 8) {
      alert("MRN harus berisi angka saja, maksimal 8 karakter");
      return;
    }
    try {
      const res = await fetch("/api/admin/patient-login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: newPatientQueue, mrn: newPatientMrn }),
      });
      if (res.ok) {
        const pl = await res.json();
        setPatientLogins([...patientLogins, pl]);
        setNewPatientQueue("");
        setNewPatientMrn("");
      }
    } catch (error) {
      console.error("Error creating patient login:", error);
    }
  };

  const deleteAllPatientLogins = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua data login pasien?")) return;
    try {
      const res = await fetch("/api/admin/patient-login", {
        method: 'DELETE',
      });
      if (res.ok) {
        setPatientLogins([]);
      }
    } catch (error) {
      console.error("Error deleting patient logins:", error);
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
      background: "linear-gradient(135deg, #007bff 0%, #e3f2fd 100%)",
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, color: "#28a745" }}>Dashboard Admin Panorama</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => router.push("/admin/history")}
              style={{
                padding: "8px 14px",
                background: "linear-gradient(135deg, #007bff 0%, #1e3a8a 100%)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Lihat Riwayat Antrean
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/feedback")}
              style={{
                padding: "8px 14px",
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Lihat Daftar Feedback
            </button>
          </div>
        </div>

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
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Menunggu", "Dipanggil", "Selesai"].map((status) => {
                      let background = "#f8f9fa";
                      let color = "#333";

                      if (status === "Menunggu") {
                        background = "#fff3cd";
                        color = "#856404";
                      } else if (status === "Dipanggil") {
                        background = "#cce5ff";
                        color = "#004085";
                      } else if (status === "Selesai") {
                        background = "#d4edda";
                        color = "#155724";
                      }

                      const isActive = q.status === status;
                      const isLoading =
                        updatingQueueId === q.id && updatingStatus === status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateQueueStatus(q.id, status)}
                          disabled={isLoading || isActive}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: isActive ? "2px solid #343a40" : "1px solid #ced4da",
                            background,
                            color,
                            cursor: isLoading || isActive ? "not-allowed" : "pointer",
                            fontSize: "12px",
                            minWidth: "80px",
                          }}
                        >
                          {isLoading ? "Mengubah..." : status}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(q.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tabel Riwayat Login Pasien */}
        <h2 style={{ marginBottom: "20px" }}>Riwayat Login Pasien</h2>
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
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Antrean</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>MRN</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Waktu Login</th>
            </tr>
          </thead>
          <tbody>
            {patientLogins.map((login, i) => (
              <tr key={login.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{login.id}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{login.nomorAntrean}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{login.nomorRekamMedis}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{login.statusAntrean}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(login.waktuLogin).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tabel Feedback dipindahkan ke /admin/feedback */}
      </main>
    </div>
  );
}
