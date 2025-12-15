"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const loginData = localStorage.getItem("panorama_login");

    if (!loginData) {
      router.replace("/login");
      return;
    }

    setData(JSON.parse(loginData));
  }, [router]);

  if (!data) return null;

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Selamat Datang 👋</h2>

      <p>
        Nomor Antrean: <strong>{data.nomorAntrian}</strong>
      </p>

      <h3>Perkembangan Resep</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Entry</td><td>✔ Selesai</td></tr>
          <tr><td>Transport</td><td>✔ Selesai</td></tr>
          <tr><td>Pengemasan</td><td>⏳ Proses</td></tr>
          <tr><td>Siap Diambil</td><td>⏺ Belum</td></tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: "30px" }}>Kirim Feedback</h3>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "10px" }}
      />

      <button
        onClick={() => alert("Feedback terkirim (simulasi)")}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Kirim
      </button>
    </main>
  );
}
