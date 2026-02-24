"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        await loadFeedbacks();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function loadFeedbacks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/feedback");
      if (!res.ok) {
        throw new Error("Gagal memuat feedback");
      }
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = feedbacks.filter((f) => {
    const text = `${f.queue || ""} ${f.mrn || ""} ${f.message || ""}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesRating =
      ratingFilter === "ALL" || String(f.rating || "") === String(ratingFilter);
    return matchesSearch && matchesRating;
  });

  if (loading) {
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, color: "#28a745" }}>Daftar Feedback Pasien</h1>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            style={{
              padding: "8px 14px",
              background: "#f8f9fa",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Kembali ke Dashboard
          </button>
        </div>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          Pantau dan analisis feedback pelayanan pasien pada instalasi farmasi.
        </p>

        {/* Filter */}
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "8px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Cari berdasarkan antrean / MRN / pesan"
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
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minWidth: "140px",
            }}
          >
            <option value="ALL">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
        </div>

        {/* Tabel Feedback */}
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
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Antrean
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  MRN
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Pesan
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Rating
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={f.id}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f8f9fa",
                  }}
                >
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {f.queue}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {f.mrn}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {f.message}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {"⭐".repeat(f.rating)} ({f.rating})
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {formatDateTime(f.time)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    Tidak ada feedback yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

