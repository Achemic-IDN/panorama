"use client";

import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const params = useSearchParams();
  const queue = params.get("queue");

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>

      <p>
        Selamat datang, <strong>Nomor Antrean: {queue}</strong>
      </p>

      <h2>Status Resep</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Entry</td><td>✔</td></tr>
          <tr><td>Transport</td><td>✔</td></tr>
          <tr><td>Pengemasan</td><td>⏳</td></tr>
          <tr><td>Siap Diambil</td><td>❌</td></tr>
        </tbody>
      </table>

      <h2>Feedback</h2>
      <textarea
        placeholder="Tulis feedback Anda"
        style={{ width: "100%", height: "80px" }}
      />
      <br /><br />
      <button>Kirim Feedback</button>
    </main>
  );
}
