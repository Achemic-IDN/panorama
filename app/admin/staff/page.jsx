"use client";

import { useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { value: "ENTRY", label: "ENTRY (Entri Resep)" },
  { value: "TRANSPORT", label: "TRANSPORT (Pengambilan Obat)" },
  { value: "PACKAGING", label: "PACKAGING (Peracikan/Pengemasan)" },
  { value: "PICKUP", label: "PICKUP (Serah Terima)" },
  { value: "ADMIN", label: "ADMIN" },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ENTRY");
  const [creating, setCreating] = useState(false);

  async function loadStaff() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Gagal mengambil data staff");
        setLoading(false);
        return;
      }
      setStaff(Array.isArray(json) ? json : []);
      setLoading(false);
    } catch (e) {
      setError("Gagal mengambil data staff");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name || !username || !password || !role) {
      setError("Semua field wajib diisi");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, role }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Gagal membuat staff");
        setCreating(false);
        return;
      }
      setName("");
      setUsername("");
      setPassword("");
      setRole("ENTRY");
      await loadStaff();
    } catch (e) {
      setError("Gagal membuat staff");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #007bff 0%, #e3f2fd 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <main
        style={{
          maxWidth: "1100px",
          margin: "auto",
          background: "white",
          padding: "32px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#1e3a8a", marginBottom: "16px" }}>
          Manajemen Staff PANORAMA
        </h1>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px 12px",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            marginBottom: "24px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Tambah Staff Baru</h2>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}
          >
            <input
              type="text"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                flex: "1 1 160px",
                minWidth: "160px",
              }}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                flex: "1 1 140px",
                minWidth: "140px",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                flex: "1 1 140px",
                minWidth: "140px",
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                flex: "0 0 180px",
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "10px 18px",
                borderRadius: "4px",
                border: "none",
                background: creating
                  ? "#ccc"
                  : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "#fff",
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "Menyimpan..." : "Tambah Staff"}
            </button>
          </form>
        </section>

        <section>
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Daftar Staff</h2>
          {loading ? (
            <div>Loading...</div>
          ) : staff.length === 0 ? (
            <div style={{ color: "#666" }}>Belum ada staff.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    ID
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    Nama
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    Username
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    Role
                  </th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, idx) => (
                  <tr key={s.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.id}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.name}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.username}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.role}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

