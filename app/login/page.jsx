"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [antrean, setAntrean] = useState("");
  const [mrn, setMrn] = useState("");

  const handleLogin = () => {
    if (antrean && mrn) {
      router.push("/dashboard");
    } else {
      alert("Nomor antrean dan MRN harus diisi");
    }
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Login Pasien</h1>

      <div style={{ marginTop: "30px" }}>
        <label>Nomor Antrean</label>
        <input
          type="text"
          value={antrean}
          onChange={(e) => setAntrean(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Nomor Rekam Medis (MRN)</label>
        <input
          type="text"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>

      <button
        onClick={handleLogin}
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "12px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Masuk Dashboard
      </button>
    </main>
  );
}
