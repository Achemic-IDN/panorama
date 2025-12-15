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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "patient",
        queue: queue,
        mrn: mrn,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Login gagal. Periksa Nomor Antrean dan MRN.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "320px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "5px" }}>
          PANORAMA
        </h1>

        <p style={{ textAlign: "center", color: "#555", marginBottom: "20px" }}>
          Login Pasien
        </p>

        <label>Nomor Antrean</label>
        <input
          type="text"
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          placeholder="Contoh: ABC123"
          required
          style={inputStyle}
        />

        <label>Nomor Rekam Medis (MRN)</label>
        <input
          type="text"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          placeholder="Contoh: 999999"
          required
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>
            {error}
          </p>
        )}

        <button type="submit" style={buttonStyle}>
          Masuk Dashboard
        </button>
      </form>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
