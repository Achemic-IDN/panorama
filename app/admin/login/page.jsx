"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginAdmin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "admin",
        username,
        password,
      }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Login admin gagal");
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login Admin PANORAMA</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Login Admin
      </button>
    </main>
  );
}
