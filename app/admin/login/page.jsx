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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #28a745 0%, #ffffff 100%)",
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
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Login Admin PANORAMA</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
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
          Login Admin
        </button>
      </div>
    </div>
  );
}
