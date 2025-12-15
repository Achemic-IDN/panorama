"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [antrian, setAntrian] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!antrian || !mrn) {
      setError("Nomor antrean dan MRN wajib diisi");
      return;
    }

    // SIMPAN DATA LOGIN
    localStorage.setItem(
      "panorama_login",
      JSON.stringify({
        nomorAntrian: antrian,
        mrn: mrn,
      })
    );

    router.push("/dashboard");
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "400px", margin: "auto" }}>
      <h2>Login Pasien</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Nomor Antrean</label>
        <input
          value={antrian}
          onChange={(e) => setAntrian(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Nomor Rekam Medis (MRN)</label>
        <input
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Masuk Dashboard
      </button>
    </main>
  );
}
