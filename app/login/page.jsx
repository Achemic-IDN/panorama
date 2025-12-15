"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nomorAntrean, setNomorAntrean] = useState("");
  const [mrn, setMrn] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomorAntrean, mrn }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Login gagal");
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Login PANORAMA</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Nomor Antrean"
          value={nomorAntrean}
          onChange={(e) => setNomorAntrean(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Nomor Rekam Medis"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
        />
        <br /><br />
        <button type="submit">Masuk</button>
      </form>
    </main>
  );
}
