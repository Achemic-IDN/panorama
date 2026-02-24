"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusLabel } from "@/lib/status";

function getRoleLabel(role) {
  switch (role) {
    case "ENTRY":
      return "ENTRY (Entri Resep)";
    case "TRANSPORT":
      return "TRANSPORT (Pengambilan Obat)";
    case "PACKAGING":
      return "PACKAGING (Peracikan/Pengemasan)";
    case "PICKUP":
      return "PICKUP (Serah Terima)";
    case "ADMIN":
      return "ADMIN";
    default:
      return role || "-";
  }
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState(null);
  const [queues, setQueues] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const title = useMemo(() => {
    if (!staff?.role) return "Dashboard Staff";
    return `Dashboard Staff - ${getRoleLabel(staff.role)}`;
  }, [staff?.role]);

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

      setStaff(json.data.staff);
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
            <strong>{getRoleLabel(staff.role)}</strong>
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Nomor</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>MRN</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Stage</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {queues.map((q, idx) => (
                    <tr key={q.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{q.queue}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{q.mrn}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <strong>{getStatusLabel(q.status)}</strong> <span style={{ color: "#666" }}>({q.status})</span>
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <button
                          type="button"
                          onClick={() => advance(q.id)}
                          disabled={updatingId === q.id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: updatingId === q.id ? "#ccc" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                            color: "white",
                            cursor: updatingId === q.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {updatingId === q.id ? "Memproses..." : "Proses & Lanjut"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

