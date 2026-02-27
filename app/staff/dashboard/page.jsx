"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusLabel } from "@/lib/status";
import { getRoleLabel } from "@/lib/staffLabels";
import StatusBadge from "@/lib/components/StatusBadge";
import ProgressTracker from "@/lib/components/ProgressTracker";
import { getSocketClient } from "@/lib/socketClient";
import { escapeHtml, csrfFetch } from "@/lib/utils";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [queues, setQueues] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
   const [stats, setStats] = useState(null);
   const [statsError, setStatsError] = useState("");
   const [notificationMessage, setNotificationMessage] = useState("");
   const [dateFromFilter, setDateFromFilter] = useState("");
   const [dateToFilter, setDateToFilter] = useState("");

  const title = useMemo(() => {
    if (!activeRole) return "Dashboard Staff";
    return `Dashboard Staff - ${getRoleLabel(activeRole)}`;
  }, [activeRole]);

  const sortedQueues = useMemo(() => {
    const list = Array.isArray(queues) ? [...queues] : [];
    return list.sort((a, b) => {
      const ap = a?.priority ? 1 : 0;
      const bp = b?.priority ? 1 : 0;
      if (bp !== ap) return bp - ap; // priority first
      const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return at - bt; // oldest first
    });
  }, [queues]);

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

  // Admin UTAMA monitoring stats (today) - polled every 10s
  useEffect(() => {
    if (activeRole !== "UTAMA") return;

    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch("/api/admin/queue-stats", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json?.error) {
          if (!cancelled) {
            setStatsError(json?.error || "Gagal mengambil statistik antrean");
          }
          return;
        }
        if (!cancelled) {
          setStats(json);
          setStatsError("");
        }
      } catch (e) {
        if (!cancelled) {
          setStatsError("Gagal mengambil statistik antrean");
        }
      }
    }

    loadStats();
    const intervalId = setInterval(loadStats, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeRole]);

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

  // Realtime update antrean via WebSocket (Socket.io) + polling fallback
  useEffect(() => {
    if (!staff || !activeRole) return;

    const client = getSocketClient();
    client.connect(activeRole);

    const updateIfPresent = (updated) => {
      if (!updated || !updated.id) return;
      setQueues((prev) => {
        const idx = prev.findIndex((q) => q.id === updated.id);
        if (idx === -1) {
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...next[idx], ...updated };
        return next;
      });
    };

    const offUpdated = client.on("queue:updated", (event) => {
      const queue = event?.data || event;
      updateIfPresent(queue);
    });

    const offMoved = client.on("queue:moved", (event) => {
      const queue = event?.data || event;
      updateIfPresent(queue);
    });

    const offCompleted = client.on("queue:completed", (event) => {
      const queue = event?.data || event;
      updateIfPresent(queue);
    });

    return () => {
      offUpdated();
      offMoved();
      offCompleted();
      // Do not disconnect the singleton socket client here to allow reuse.
    };
  }, [staff, activeRole]);

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
      await csrfFetch("/api/staff/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      router.push("/staff/login");
      setLoggingOut(false);
    }
  }

  // helpers for stats/export (UTAMA only or generic)
  async function fetchStats() {
    try {
      const params = new URLSearchParams();
      if (dateFromFilter) params.set('dateFrom', dateFromFilter);
      if (dateToFilter) params.set('dateTo', dateToFilter);
      const res = await fetch(`/api/admin/queue-stats?${params.toString()}`, { cache: 'no-store' });
      const statJson = await res.json();
      if (!res.ok) {
        throw new Error(statJson.error || 'Stats fetch failed');
      }
      setStats(statJson);
      setStatsError(null);
    } catch (e) {
      setStatsError(e.message);
    }
  }

  function exportQueues() {
    try {
      import('@/lib/exportUtils').then((m) => m.exportToCSV(queues, 'queues_export.csv'));
    } catch {}
  }

  function exportStats() {
    if (!stats) return;
    try {
      import('@/lib/exportUtils').then((m) => m.exportToJSON(stats, 'stats.json'));
    } catch {}
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
            <button
              type="button"
              onClick={exportQueues}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #17a2b8",
                background: "#17a2b8",
                color: "white",
                cursor: "pointer",
              }}
            >
              Export Queues
            </button>
            {activeRole === "UTAMA" && (
              <button
                type="button"
                onClick={() => router.push("/admin/audit-logs")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ffc107",
                  background: "#ffc107",
                  color: "#343a40",
                  cursor: "pointer",
                }}
              >
                Audit Logs
              </button>
            )}
          </div>
        </div>

        {staff && (
          <div style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}>
            Login sebagai <strong>{staff.name}</strong> ({staff.username}) — Role:{" "}
            <strong>{getRoleLabel(activeRole)}</strong>
          </div>
        )}        {notificationMessage && (
          <div style={{ marginTop: "10px", background: "#d1ecf1", color: "#0c5460", padding: "8px", borderRadius: "6px" }}>
            {escapeHtml(notificationMessage)}
          </div>
        )}
        {activeRole === "UTAMA" && stats && (
          <section
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              padding: "16px",
              borderRadius: "8px",
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "16px", color: "#1e3a8a" }}>
              Monitoring Antrean Hari Ini
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "14px" }}>
                Dari:
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  style={{ marginLeft: "4px" }}
                />
              </label>
              <label style={{ fontSize: "14px" }}>
                Sampai:
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  style={{ marginLeft: "4px" }}
                />
              </label>
              <button
                type="button"
                onClick={fetchStats}
                style={{ padding: "6px 12px" }}
              >
                Tampilkan
              </button>
              <button
                type="button"
                onClick={exportStats}
                style={{ padding: "6px 12px" }}
              >
                Export Stats
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Total Antrian Hari Ini</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#3685fc" }}>{stats.totalHariIni}</div>
              </div>
              <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Sedang Diproses</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#0c5460" }}>{stats.sedangDiproses}</div>
              </div>
              <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Selesai</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#155724" }}>{stats.selesai}</div>
              </div>
              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Rata-rata Waktu Entry</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {stats.avgEntry != null
                    ? `${Math.floor(stats.avgEntry / 60)}m ${stats.avgEntry % 60}s`
                    : "-"}
                </div>
              </div>
              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Rata-rata Waktu Packaging</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {stats.avgPackaging != null
                    ? `${Math.floor(stats.avgPackaging / 60)}m ${stats.avgPackaging % 60}s`
                    : "-"}
                </div>
              </div>
              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Rata-rata Total Pelayanan</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {stats.avgTotal != null
                    ? `${Math.floor(stats.avgTotal / 60)}m ${stats.avgTotal % 60}s`
                    : "-"}
                </div>
              </div>
            </div>
            {stats.generatedAt && (
              <div style={{ marginTop: "6px", fontSize: "11px", color: "#868e96" }}>
                Diperbarui: {new Date(stats.generatedAt).toLocaleTimeString()}
              </div>
            )}
          </section>
        )}

        {statsError && activeRole === "UTAMA" && (
          <div
            style={{
              marginTop: "8px",
              background: "#fff3cd",
              color: "#856404",
              padding: "8px 10px",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            {statsError}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "16px",
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px 12px",
              borderRadius: "6px",
            }}
          >
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
                {sortedQueues.map((q) => (
                  <div key={q.id} style={{
                    padding: 16,
                    borderRadius: 10,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontSize: 40, fontWeight: 800, color: '#1e3a8a' }}>{escapeHtml(q.queue)}</div>
                          {q.priority && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: "#fff3cd",
                              border: "1px solid #ffe69c",
                              color: "#856404",
                              height: "fit-content",
                            }}>
                              PRIORITAS
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#666', marginTop: 6 }}>MRN: <strong>{escapeHtml(q.mrn)}</strong></div>
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

