"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStatusLabel, isInProgressStatus } from "@/lib/status";
import { getNextStage } from "@/lib/workflowConfig";
import StatusBadge from "@/lib/components/StatusBadge";
import ProgressTracker from "@/lib/components/ProgressTracker";
import { getSocketClient } from "@/lib/socketClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [queues, setQueues] = useState([]);
  const [patientLogins, setPatientLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingQueueId, setUpdatingQueueId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [realtimeError, setRealtimeError] = useState(null);

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

  // Realtime update antrean via SSE
  useEffect(() => {
    if (loading) return;

    const source = new EventSource("/api/realtime/queue");

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data || !data.id) return;

        setQueues((prev) => {
          const idx = prev.findIndex((q) => q.id === data.id);
          if (idx === -1) {
            // Tambahkan antrean baru bila belum ada
            return [data, ...prev];
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...data };
          return next;
        });
        setRealtimeError(null);
      } catch (e) {
        console.error("Invalid SSE queue data (admin):", e);
      }
    };

    source.onerror = (err) => {
      console.error("SSE error (admin dashboard):", err);
      setRealtimeError("Koneksi realtime antrean terputus, akan mencoba ulang otomatis.");
    };

    return () => {
      source.close();
    };
  }, [loading]);

  // Realtime update antrean via WebSocket (Socket.io) + polling fallback
  useEffect(() => {
    if (loading) return;

    const client = getSocketClient();
    client.connect("UTAMA");

    const upsertQueue = (updated) => {
      if (!updated || !updated.id) return;
      setQueues((prev) => {
        const idx = prev.findIndex((q) => q.id === updated.id);
        if (idx === -1) {
          return [updated, ...prev];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], ...updated };
        return next;
      });
    };

    const offCreated = client.on("queue:created", (event) => {
      const queue = event?.data || event;
      if (!queue || !queue.id) return;
      setQueues((prev) => {
        if (prev.some((q) => q.id === queue.id)) return prev;
        return [queue, ...prev];
      });
    });

    const offUpdated = client.on("queue:updated", (event) => {
      const queue = event?.data || event;
      upsertQueue(queue);
    });

    const offMoved = client.on("queue:moved", (event) => {
      const queue = event?.data || event;
      upsertQueue(queue);
    });

    const offCompleted = client.on("queue:completed", (event) => {
      const queue = event?.data || event;
      upsertQueue(queue);
    });

    // Polling fallback (every 10 seconds) if websocket is unavailable
    const offPolled = client.on("queue:polled", (payload) => {
      const polled = payload?.queues;
      if (Array.isArray(polled)) {
        setQueues(polled);
      }
    });

    return () => {
      offCreated();
      offUpdated();
      offMoved();
      offCompleted();
      offPolled();
      // Do not disconnect the singleton socket client here to allow reuse.
    };
  }, [loading]);

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

  // Calculate stats from queues (menggunakan enum baru)
  const stats = {
    total: queues.length,
    waiting: queues.filter(q => q.status === "WAITING").length,
    inProgress: queues.filter(q => isInProgressStatus(q.status)).length,
    completed: queues.filter(q => q.status === "COMPLETED").length,
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
            <button
              type="button"
              onClick={() => router.push("/admin/staff")}
              style={{
                padding: "8px 14px",
                background: "linear-gradient(135deg, #6c757d 0%, #343a40 100%)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Kelola Staff
            </button>
          </div>
        </div>

        {realtimeError && (
          <div style={{ marginBottom: "10px", background: "#fff3cd", color: "#856404", padding: "8px 10px", borderRadius: "6px" }}>
            {realtimeError}
          </div>
        )}

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
            <h3>Sedang Diproses</h3>
            <p style={{ fontSize: "24px", color: "#0c5460" }}>{stats.inProgress}</p>
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
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a' }}>{q.queue}</div>
                    <div style={{ marginTop: 6 }}><StatusBadge status={q.status} /></div>
                  </div>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{q.mrn}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <div style={{ marginBottom: "6px", fontSize: "13px" }}>
                    Tahap saat ini: <strong>{getStatusLabel(q.status)}</strong>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <ProgressTracker status={q.status} />
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginBottom: "6px" }}>
                    {(() => {
                      const nextStage = getNextStage(q.status);
                      const isTerminal = q.status === "SELESAI" || q.status === "CANCELLED";
                      const isLoading =
                        updatingQueueId === q.id && updatingStatus === nextStage;

                      if (!nextStage || isTerminal) {
                        return null;
                      }

                      let background = "#cce5ff";
                      let color = "#004085";

                      if (nextStage === "SELESAI") {
                        background = "#d4edda";
                        color = "#155724";
                      } else if (nextStage === "MENUNGGU") {
                        background = "#fff3cd";
                        color = "#856404";
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => updateQueueStatus(q.id, nextStage)}
                          disabled={isLoading}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            border: "1px solid #ced4da",
                            background,
                            color,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontSize: "11px",
                            minWidth: "110px",
                          }}
                        >
                          {isLoading
                            ? "Mengubah..."
                            : `Lanjut ke ${getStatusLabel(nextStage)}`}
                        </button>
                      );
                    })()}
                    {/* Tombol batalkan */}
                    <button
                      type="button"
                      onClick={() => updateQueueStatus(q.id, "CANCELLED")}
                      disabled={
                        q.status === "SELESAI" ||
                        q.status === "CANCELLED" ||
                        updatingQueueId === q.id
                      }
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        border: "1px solid #dc3545",
                        background: "#f8d7da",
                        color: "#721c24",
                        cursor:
                          q.status === "COMPLETED" ||
                          q.status === "CANCELLED" ||
                          updatingQueueId === q.id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "11px",
                        minWidth: "90px",
                      }}
                    >
                      Batalkan
                    </button>
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
