"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("panoramaUser");
    if (!data) {
      router.push("/login");
    } else {
      setUser(JSON.parse(data));
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("panoramaUser");
    router.push("/login");
  }

  if (!user) return null;

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>
      <p>Selamat datang 👋</p>

      <p>
        <strong>Nomor Antrean:</strong> {user.nomorAntrian}
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

      <h3 style={{ marginTop: "30px" }}>Umpan Balik Pasien</h3>

      <textarea
        placeholder="Tulis kritik atau saran..."
        style={{ width: "100%", height: "80px" }}
      />

      <br />
      <button style={{ marginTop: "10px" }}>
        Kirim Feedback
      </button>

      <br /><br />
      <button onClick={handleLogout} style={{ color: "red" }}>
        Logout
      </button>
    </main>
  );
}
