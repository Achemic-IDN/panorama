"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleLabel } from "@/lib/staffLabels";
import { csrfFetch } from "@/lib/utils";

export default function AdminSelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const ALL_ROLES = ["UTAMA", "ENTRY", "TRANSPORT", "PACKAGING", "PENYERAHAN"];

  useEffect(() => {
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
    try {
      await csrfFetch("/api/staff/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (role === "UTAMA") {
        router.push("/admin/dashboard");
      } else {
        router.push("/staff/dashboard");
      }
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
        <p style={{ fontSize: "0.9em", color: "#555" }}>
          Tombol berwarna abu‑abu berarti Anda tidak punya role tersebut –
          silakan login dengan akun yang sesuai atau hubungi admin.
        </p>
        {ALL_ROLES.map((r) => {
          const available = roles.includes(r);
          const label = getRoleLabel(r);
          const displayText = available ? label : `${label} (login dulu)`;
          const title = available ? undefined : "Silakan gunakan akun dengan role ini";
          return (
            <button
              key={r}
              onClick={() => available && choose(r)}
              disabled={!available}
              title={title}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: available ? "pointer" : "not-allowed",
                opacity: available ? 1 : 0.5,
              }}
            >
              {displayText}
            </button>
          );
        })}
      </div>
    </div>
  );
}
