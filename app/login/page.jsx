"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [queue, setQueue] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // VALIDASI SEDERHANA
    if (!queue || !mrn) {
      setError("Nomor antrean dan MRN wajib diisi");
      return;
    }

    if (mrn.length < 5) {
      setError("Nomor rekam medis tidak valid");
      return;
    }

    // JIKA VALID → MASUK DASHBOARD
    router.push(`/dashboard?queue=${queue}`);
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "400px", margin: "auto" }}>
      <h1>PANORAMA</h1>
      <p>Login Pasien</p>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Nomor Antrean"
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          placeholder="Nomor Rekam Medis"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button style={{ padding: "10px", width: "100%" }}>
          Masuk Dashboard
        </button>
      </form>
    </main>
  );
}
