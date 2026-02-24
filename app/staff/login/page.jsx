"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.message || "Login gagal");
        return;
      }

      // If multiple roles are returned ask user to select
      if (json.data && Array.isArray(json.data.roles) && json.data.roles.length > 1) {
        router.push("/staff/select-role");
      } else {
        // already set by server when single role
        router.push("/staff/dashboard");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #007bff 0%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Login Staff</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading
              ? "#ccc"
              : "linear-gradient(135deg, #007bff 0%, #1e3a8a 100%)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.transform = "scale(1.02)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </div>
    </div>
  );
}

