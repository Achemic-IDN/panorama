"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [queueId, setQueueId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        await loadLogs();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (queueId) params.set("queueId", queueId);
      if (staffId) params.set("staffId", staffId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/queue-audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat audit log");
      }
      const json = await res.json();
      setLogs(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadLogs();
  }

  function handleResetFilters() {
    setQueueId("");
    setStaffId("");
    setDateFrom("");
    setDateTo("");
    loadLogs();
  }

  function handleExportCsv() {
    const params = new URLSearchParams();
    if (queueId) params.set("queueId", queueId);
    if (staffId) params.set("staffId", staffId);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("format", "csv");
    window.open(`/api/admin/queue-audit-logs?${params.toString()}`, "_blank");
  }

  if (loading && logs.length === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
          maxWidth: "1200px",
          margin: "auto",
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#007bff",
            marginBottom: "10px",
          }}
        >
          Audit Log Aksi Antrean
        </h1>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "#555" }}>
          Riwayat perubahan dan tindakan oleh staff/ admin
        </p>

        <form onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              placeholder="Queue ID"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              style={{ padding: "8px", flex: "1" }}
            />
            <input
              placeholder="Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ padding: "8px", flex: "1" }}
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: "8px" }}
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: "8px" }}
            />
            <button type="submit" style={{ padding: "8px 16px" }}>
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ padding: "8px 16px" }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{ padding: "8px 16px" }}
            >
              Export CSV
            </button>
          </div>
        </form>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                Queue
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                Staff
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                Action
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                From → To
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                Notes
              </th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.id}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.queue?.queue || "-"}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.staff?.name || "-"}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.action}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.fromStage || ""} → {l.toStage || ""}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {l.notes || ""}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee" }}>
                  {formatDateTime(l.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
