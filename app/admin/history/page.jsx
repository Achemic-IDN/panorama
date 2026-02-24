"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "WAITING", label: "Waiting" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function QueueHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    totalToday: 0,
    avgWaitingMinutes: null,
    avgServiceMinutes: null,
    completedCount: 0,
    hourly: [],
  });

  useEffect(() => {
    async function init() {
      try {
        // Auth check
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        await loadLogs(1, status, search, dateFrom, dateTo);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadLogs(
    pageToLoad = 1,
    statusFilter = status,
    searchText = search,
    from = dateFrom,
    to = dateTo
  ) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageToLoad));
      params.set("pageSize", String(pageSize));
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchText) params.set("search", searchText);
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);

      const res = await fetch(`/api/admin/queue-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat riwayat antrean");
      }
      const json = await res.json();
      setLogs(json.items || []);
      setTotal(json.total || 0);
      setStats(json.stats || {});
      setPage(json.page || pageToLoad);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadLogs(1);
  }

  function handleResetFilters() {
    setStatus("ALL");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    loadLogs(1, "ALL", "", "", "");
  }

  function handleExportCsv() {
    const params = new URLSearchParams();
    params.set("format", "csv");
    if (status && status !== "ALL") params.set("status", status);
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    window.open(`/api/admin/queue-logs?${params.toString()}`, "_blank");
  }

  function handlePrint() {
    window.print();
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

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
          Riwayat Antrean
        </h1>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "#555" }}>
          Monitoring dan analisis riwayat antrean farmasi
        </p>

        {/* Statistik ringkas */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              flex: 1,
              minWidth: "180px",
              textAlign: "center",
            }}
          >
            <h3>Total Antrean (Hari Ini)</h3>
            <p style={{ fontSize: "24px", color: "#3685fc" }}>
              {stats.totalToday ?? 0}
            </p>
          </div>
          <div
            style={{
              background: "#fff3cd",
              padding: "20px",
              borderRadius: "8px",
              flex: 1,
              minWidth: "180px",
              textAlign: "center",
            }}
          >
            <h3>Rata-rata Waktu Tunggu</h3>
            <p style={{ fontSize: "20px", color: "#856404" }}>
              {stats.avgWaitingMinutes != null
                ? `${stats.avgWaitingMinutes} menit`
                : "-"}
            </p>
          </div>
          <div
            style={{
              background: "#d4edda",
              padding: "20px",
              borderRadius: "8px",
              flex: 1,
              minWidth: "180px",
              textAlign: "center",
            }}
          >
            <h3>Rata-rata Waktu Layanan</h3>
            <p style={{ fontSize: "20px", color: "#155724" }}>
              {stats.avgServiceMinutes != null
                ? `${stats.avgServiceMinutes} menit`
                : "-"}
            </p>
          </div>
          <div
            style={{
              background: "#d1ecf1",
              padding: "20px",
              borderRadius: "8px",
              flex: 1,
              minWidth: "180px",
              textAlign: "center",
            }}
          >
            <h3>Jumlah Selesai</h3>
            <p style={{ fontSize: "24px", color: "#0c5460" }}>
              {stats.completedCount ?? 0}
            </p>
          </div>
        </div>

        {/* Grafik: Jumlah antrean per jam & rata-rata waktu tunggu per jam */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: "260px",
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#333" }}>
              Jumlah Antrean per Jam (hari ini)
            </h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Setiap bar mewakili jumlah antrean berdasarkan jam waktu ambil.
            </p>
            {Array.isArray(stats.hourly) && stats.hourly.some((h) => h.count > 0) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {stats.hourly
                  .filter((h) => h.count > 0)
                  .map((h) => {
                    const maxCount = Math.max(
                      ...stats.hourly.map((x) => x.count || 0),
                      1
                    );
                    const width = `${(h.count / maxCount) * 100}%`;
                    return (
                      <div key={h.hour} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ width: "40px", fontSize: "12px" }}>
                          {String(h.hour).padStart(2, "0")}:00
                        </span>
                        <div
                          style={{
                            flex: 1,
                            marginLeft: "6px",
                            background: "#e3f2fd",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width,
                              background:
                                "linear-gradient(90deg, #007bff 0%, #1e3a8a 100%)",
                              height: "16px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            width: "36px",
                            marginLeft: "6px",
                            fontSize: "12px",
                            textAlign: "right",
                          }}
                        >
                          {h.count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "#777" }}>
                Belum ada data antrean untuk hari ini.
              </p>
            )}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: "260px",
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#333" }}>
              Rata-rata Waktu Tunggu per Jam (hari ini)
            </h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Menunjukkan rata-rata waktu tunggu (menit) dari antrean yang sudah
              dipanggil per jam.
            </p>
            {Array.isArray(stats.hourly) &&
            stats.hourly.some((h) => h.avgWaitingMinutes != null) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {stats.hourly
                  .filter((h) => h.avgWaitingMinutes != null)
                  .map((h) => {
                    const maxWait = Math.max(
                      ...stats.hourly.map((x) => x.avgWaitingMinutes || 0),
                      1
                    );
                    const width = `${(h.avgWaitingMinutes / maxWait) * 100}%`;
                    return (
                      <div key={h.hour} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ width: "40px", fontSize: "12px" }}>
                          {String(h.hour).padStart(2, "0")}:00
                        </span>
                        <div
                          style={{
                            flex: 1,
                            marginLeft: "6px",
                            background: "#fff3cd",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width,
                              background:
                                "linear-gradient(90deg, #ffc107 0%, #ff9800 100%)",
                              height: "16px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            width: "60px",
                            marginLeft: "6px",
                            fontSize: "12px",
                            textAlign: "right",
                          }}
                        >
                          {h.avgWaitingMinutes} m
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "#777" }}>
                Belum ada data tunggu yang lengkap untuk ditampilkan.
              </p>
            )}
          </div>
        </div>

        {/* Filter */}
        <form
          onSubmit={handleFilterSubmit}
          style={{
            marginBottom: "20px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#333" }}>
            Filter Riwayat Antrean
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <span>s/d</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "160px",
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Cari nama / MRN / nomor antrean"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background:
                  "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: "8px 16px",
                background: "#e0e0e0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Actions: Export / Print */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: "8px 16px",
              background:
                "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              background:
                "linear-gradient(135deg, #6c757d 0%, #343a40 100%)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Print Laporan
          </button>
        </div>

        {/* Tabel Riwayat Antrean */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Antrean
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Nama Pasien
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  MRN
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Jenis Layanan
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu Ambil
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu Dipanggil
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu Selesai
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu Tunggu (menit)
                </th>
                <th
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu Layanan (menit)
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={log.id}
                  style={{
                    background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                  }}
                >
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.queueNumber}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.patientName || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.medicalRecordNumber}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.serviceType || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.status}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {formatDateTime(log.calledAt)}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {formatDateTime(log.completedAt)}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.waitingTimeMinutes != null
                      ? log.waitingTimeMinutes
                      : "-"}
                  </td>
                  <td
                    style={{ padding: "10px", border: "1px solid #ddd" }}
                  >
                    {log.serviceTimeMinutes != null
                      ? log.serviceTimeMinutes
                      : "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    Tidak ada data antrean untuk filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <span>
            Halaman {page} dari {totalPages} (total {total} antrean)
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                if (page > 1) {
                  const newPage = page - 1;
                  setPage(newPage);
                  loadLogs(newPage);
                }
              }}
              disabled={page <= 1}
              style={{
                padding: "6px 12px",
                background: page <= 1 ? "#e0e0e0" : "#f8f9fa",
                borderRadius: "4px",
                border: "1px solid #ddd",
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => {
                if (page < totalPages) {
                  const newPage = page + 1;
                  setPage(newPage);
                  loadLogs(newPage);
                }
              }}
              disabled={page >= totalPages}
              style={{
                padding: "6px 12px",
                background: page >= totalPages ? "#e0e0e0" : "#f8f9fa",
                borderRadius: "4px",
                border: "1px solid #ddd",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

