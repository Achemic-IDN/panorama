"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleLabel } from "@/lib/staffLabels"; // we'll create helper

export default function SelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // read roles from server by re-fetching staff info
    async function fetchRoles() {
      try {
        const res = await fetch("/api/staff/queues", { cache: "no-store" });
        const json = await res.json();
        if (res.ok && json?.data?.staff) {
          setRoles(json.data.staff.roles || []);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      setError("Gagal mengambil daftar role");
    }

    fetchRoles();
  }, []);

  async function choose(role) {
    // set cookie via endpoint or client side
    try {
      await fetch("/api/staff/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.push("/staff/dashboard");
    } catch (e) {
      setError("Gagal memilih role");
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
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Pilih Role</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => choose(r)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            {getRoleLabel(r)}
          </button>
        ))}
      </div>
    </div>
  );
}
