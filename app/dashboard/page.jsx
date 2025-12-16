"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Memuat dashboard...</p>;
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Selamat Datang</h1>

      <p>
        Nomor Antrean: <strong>{data.queue}</strong>
      </p>

      <h3>Status Resep</h3>
      <table border="1" cellPadding="10" style={{ marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Entry</td><td>{data.status === "ENTRY" ? "⏳ Proses" : "✔ Selesai"}</td></tr>
          <tr><td>Transport</td><td>{data.status === "TRANSPORT" ? "⏳ Proses" : data.status === "ENTRY" ? "-" : "✔ Selesai"}</td></tr>
          <tr><td>Pengemasan</td><td>{data.status === "PACKAGING" ? "⏳ Proses" : ["READY"].includes(data.status) ? "✔ Selesai" : "-"}</td></tr>
          <tr><td>Siap Diambil</td><td>{data.status === "READY" ? "✔ Ya" : "Belum"}</td></tr>
        </tbody>
      </table>

      <h3>Feedback</h3>
      <textarea
        placeholder="Tulis penilaian Anda..."
        style={{ width: "100%", height: 80 }}
      />

      <br /><br />

      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
        }}
      >
        Logout
      </button>
    </main>
  );
}
