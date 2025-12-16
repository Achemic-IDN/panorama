"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    // simulasi data dashboard (nanti bisa dari API)
    setData({
      queueNumber: "ABC123",
      status: "PACKAGING",
      estimatedMinutes: 15,
      pickupCounter: "Loket 2",
      timeline: [
        { step: "Entry Resep", time: "09:10" },
        { step: "Transport", time: "09:18" },
        { step: "Pengemasan", time: "09:25" },
      ],
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!data) {
    return <p style={{ padding: 40 }}>Memuat dashboard...</p>;
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>

      <p>
        Selamat datang 👋 <br />
        <b>Nomor Antrean:</b> {data.queueNumber}
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
          {["ENTRY", "TRANSPORT", "PACKAGING", "READY"].map((step) => (
            <tr key={step}>
              <td>{step}</td>
              <td>{step === data.status ? "SEDANG DIPROSES" : "✔"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 20 }}>
        ⏱ Estimasi selesai: <b>{data.estimatedMinutes} menit</b>
      </p>

      <p>
        📍 Loket pengambilan: <b>{data.pickupCounter}</b>
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Feedback Pasien</h3>
      <textarea
        placeholder="Tulis penilaian atau saran..."
        rows="4"
        style={{ width: "100%", padding: "10px" }}
      />

      <button style={{ marginTop: 10 }}>Kirim Feedback</button>

      <hr style={{ margin: "30px 0" }} />

      <button
        onClick={handleLogout}
        style={{
          background: "#e11d48",
          color: "white",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </main>
  );
}
