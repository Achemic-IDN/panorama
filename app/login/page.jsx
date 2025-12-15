"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPasien() {
  const router = useRouter();
  const [queue, setQueue] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "patient",
        queue,
        mrn,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Login gagal. Periksa nomor antrean & MRN.");
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login Pasien</h2>

      <input
        placeholder="Nomor Antrean (ABC123)"
        value={queue}
        onChange={(e) => setQueue(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        placeholder="Nomor MRN"
        value={mrn}
        onChange={(e) => setMrn(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
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
