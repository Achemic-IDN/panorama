"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    const res = await fetch("/api/dashboard", { cache: "no-store" });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Memuat data dashboard...
      </div>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>

      <p>
        Selamat datang 👋 <br />
        <strong>Nomor Antrean:</strong> {data.queueNumber}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Status Resep</h3>

      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Entry Resep</td>
            <td>{data.status === "ENTRY" ? "✅ Selesai" : "⏳ Menunggu"}</td>
          </tr>
          <tr>
            <td>Transport</td>
            <td>{data.status === "TRANSPORT" ? "🔄 Diproses" : "-"}</td>
          </tr>
          <tr>
            <td>Pengemasan</td>
            <td>{data.status === "PACKAGING" ? "📦 Diproses" : "-"}</td>
          </tr>
          <tr>
            <td>Siap Diambil</td>
            <td>{data.status === "READY" ? "✅ Ya" : "❌ Belum"}</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: "20px 0" }} />

      <h3>Feedback Pasien</h3>
      <textarea
        placeholder="Tulis feedback Anda..."
        style={{ width: "100%", height: 100 }}
      />

      <br /><br />

      <button
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Kirim Feedback
      </button>

      <br /><br />

      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
        }}
        style={{
          padding: "10px 20px",
          background: "#dc2626",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </main>
  );
}
