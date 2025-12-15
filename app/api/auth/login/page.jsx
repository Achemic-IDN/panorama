"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [queue, setQueue] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "patient", // 🔴 INI KUNCI UTAMA
        queue,
        mrn,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Login gagal. Periksa nomor antrean dan MRN.");
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h1>PANORAMA</h1>
      <p>Login Pasien</p>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Nomor Antrean"
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <input
          placeholder="Nomor MRN"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Masuk Dashboard
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}
    </main>
  );
}
