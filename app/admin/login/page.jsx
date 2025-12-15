"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        role: "admin",
        username,
        password,
      }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      alert("Login admin gagal");
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Login Admin PANORAMA</h1>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleLogin}>Masuk Admin</button>
    </main>
  );
}
