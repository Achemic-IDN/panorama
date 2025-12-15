"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [queue, setQueue] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!queue || !mrn) {
      setError("Nomor antrean dan MRN wajib diisi");
      return;
    }

    // login valid → redirect ke dashboard
    router.push(`/dashboard?queue=${queue}&mrn=${mrn}`);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "360px", padding: "24px", border: "1px solid #ddd", borderRadius: "10px" }}>
        <h1 style={{ textAlign: "center" }}>PANORAMA</h1>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Login Dashboard Pasien
        </p>

        <label>Nomor Antrean</label>
        <input
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          placeholder="Contoh: A012"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        <label>Nomor Rekam Medis</label>
        <input
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          placeholder="Contoh: 123456"
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Masuk Dashboard
        </button>
      </div>
    </main>
  );
}
