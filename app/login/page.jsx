"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nomorAntrian, setNomorAntrian] = useState("");
  const [mrn, setMrn] = useState("");

  function handleLogin() {
    if (!nomorAntrian || !mrn) {
      alert("Nomor antrean dan MRN wajib diisi");
      return;
    }

    // Simpan login
    localStorage.setItem(
      "panoramaUser",
      JSON.stringify({
        nomorAntrian,
        mrn,
      })
    );

    router.push("/dashboard");
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>PANORAMA</h1>
      <p>Login Pasien</p>

      <div style={{ maxWidth: "300px", margin: "0 auto" }}>
        <input
          placeholder="Nomor Antrean"
          value={nomorAntrian}
          onChange={(e) => setNomorAntrian(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          placeholder="Nomor Rekam Medis (MRN)"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <button
          onClick={handleLogin}
          style={{ padding: "10px", width: "100%" }}
        >
          Masuk Dashboard
        </button>
      </div>
    </main>
  );
}
