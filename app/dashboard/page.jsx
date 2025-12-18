"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/login"));
  }, [router]);

  if (!data) {
    return <p style={{ padding: 40 }}>Memuat dashboard...</p>;
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>

      <p>
        <strong>Nomor Antrean:</strong> {data.queue}
      </p>

      <h3>Status Resep</h3>

      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", marginTop: 10 }}
      >
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {["Entry", "Transport", "Pengemasan", "Siap Diambil"].map(
            (step, i) => (
              <tr key={i}>
                <td>{step}</td>
                <td>
                  {data.status === step ? "⏳ Proses" : "✔ Selesai"}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 30 }}>Kirim Feedback</h3>

      <textarea
        placeholder="Tulis pengalaman kamu..."
        style={{ width: "100%", height: 80 }}
      />

      <br />

      <button style={{ marginTop: 10 }}>Kirim Feedback</button>

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
