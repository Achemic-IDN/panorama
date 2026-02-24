"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusLabel } from "@/lib/status";
import { getRoleLabel } from "@/lib/staffLabels";
import StatusBadge from "@/lib/components/StatusBadge";
import ProgressTracker from "@/lib/components/ProgressTracker";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [queues, setQueues] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const title = useMemo(() => {
    if (!activeRole) return "Dashboard Staff";
    return `Dashboard Staff - ${getRoleLabel(activeRole)}`;
  }, [activeRole]);

  async function loadQueues() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/queues", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.message || "Gagal mengambil antrean");
        setLoading(false);
        return;
      }

      // if no active role assigned yet (user has multiple roles)
      if (!json.data.activeRole) {
        router.push("/staff/select-role");
        return;
      }

      setStaff(json.data.staff);
      setActiveRole(json.data.activeRole);
      setQueues(Array.isArray(json.data.queues) ? json.data.queues : []);
      setLoading(false);
    } catch (e) {
      setError("Gagal mengambil antrean");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueues();
  }, []);

  // Realtime update antrean untuk staff via SSE
  useEffect(() => {
    const source = new EventSource("/api/realtime/queue");

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data || !data.id) return;

        setQueues((prev) => {
          const idx = prev.findIndex((q) => q.id === data.id);
          if (idx === -1) {
            // Hanya tambahkan jika status antrean sesuai filter role saat ini
            // (server-side filter di /api/staff/queues sudah mengatur,
            //  SSE ini bersifat best-effort untuk sinkron incremental)
            if (!staff) return prev;
            return prev;
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...data };
          return next;
        });
      } catch (e) {
        console.error("Invalid SSE queue data (staff):", e);
      }
    };

    source.onerror = (err) => {
      console.error("SSE error (staff dashboard):", err);
    };

    return () => {
      source.close();
    };
  }, [staff]);

  async function advance(queueId) {
    setUpdatingId(queueId);
    try {
      const res = await fetch("/api/staff/update-stage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.message || "Gagal update stage");
        return;
      }
      // Refresh list agar queue yang sudah diproses hilang/berubah sesuai filter role
      await loadQueues();
    } catch (e) {
      setError("Gagal update stage");
    } finally {
      setUpdatingId(null);
    }
  }

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      await fetch("/api/staff/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      router.push("/staff/login");
      setLoggingOut(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #007bff 0%, #e3f2fd 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <main
        style={{
          maxWidth: "1100px",
          margin: "auto",
          background: "white",
          padding: "32px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <h1 style={{ margin: 0, color: "#1e3a8a" }}>{title}</h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={loadQueues}
              disabled={loading}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ced4da",
                background: loading ? "#f1f3f5" : "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #dc3545",
                background: loggingOut ? "#f1f3f5" : "#f8d7da",
                color: "#721c24",
                cursor: loggingOut ? "not-allowed" : "pointer",
              }}
            >
              {loggingOut ? "Keluar..." : "Logout"}
            </button>
          </div>
        </div>

        {staff && (
          <div style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}>
            Login sebagai <strong>{staff.name}</strong> ({staff.username}) — Role:{" "}
            <strong>{getRoleLabel(activeRole)}</strong>
          </div>
        )}

        {error && (
          <div style={{ marginTop: "16px", background: "#f8d7da", color: "#721c24", padding: "10px 12px", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ marginTop: "18px" }}>Loading...</div>
        ) : (
          <div style={{ marginTop: "18px" }}>
            <h2 style={{ marginBottom: "10px" }}>Antrean untuk diproses</h2>

            {queues.length === 0 ? (
              <div style={{ color: "#666" }}>Tidak ada antrean pada stage ini.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {queues.map((q) => (
                  <div key={q.id} style={{
                    padding: 16,
                    borderRadius: 10,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 40, fontWeight: 800, color: '#1e3a8a' }}>{q.queue}</div>
                        <div style={{ color: '#666', marginTop: 6 }}>MRN: <strong>{q.mrn}</strong></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge status={q.status} />
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <ProgressTracker status={q.status} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                      <button
                        type="button"
                        onClick={() => advance(q.id)}
                        disabled={updatingId === q.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: updatingId === q.id ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          cursor: updatingId === q.id ? 'not-allowed' : 'pointer',
                          fontWeight: 700
                        }}
                      >
                        {updatingId === q.id ? 'Memproses...' : 'Proses'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

