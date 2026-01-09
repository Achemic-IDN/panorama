"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPasien() {
  const router = useRouter();
  const [queue, setQueue] = useState("");
  const [mrn, setMrn] = useState("");
  const [error, setError] = useState("");

  // Handle MRN input with number-only validation and auto-capitalization
  const handleMrnChange = (e) => {
    const value = e.target.value;
    // Only allow numbers, max 8 characters, auto-capitalize
    const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 8).toUpperCase();
    setMrn(filteredValue);
  };

  async function handleLogin() {
    // Client-side validation
    if (!mrn) {
      setError("Nomor Rekam Medis wajib diisi");
      return;
    }

    if (mrn.length > 8) {
      setError("Nomor Rekam Medis maksimal 8 karakter");
      return;
    }

    if (!/^[0-9]+$/.test(mrn)) {
      setError("Nomor Rekam Medis hanya boleh berisi angka");
      return;
    }

    if (!queue) {
      setError("Nomor antrean wajib diisi");
      return;
    }

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
      const data = await res.json();
      setError(data.message || "Login gagal. Periksa nomor antrean & MRN.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #007bff 0%, #ffffff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Login Pasien</h2>

        <input
          placeholder="Nomor Antrean (ABC123)"
          value={queue}
          onChange={(e) => setQueue(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />

        <input
          placeholder="Nomor MRN"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />

        {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #007bff 0%, #1e3a8a 100%)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Masuk Dashboard
        </button>
      </div>
    </div>
  );
}
