"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleLabel } from "@/lib/staffLabels"; // we'll create helper
import { csrfFetch } from "@/lib/utils";

export default function SelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const MONITORING_ROLE = "MONITORING";

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
      await csrfFetch("/api/staff/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.push("/staff/dashboard");
    } catch (e) {
      setError("Gagal memilih role");
    }
  }

  function goMonitoring() {
    router.push("/monitor");
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

        {/* Monitoring (read-only) */}
        <div style={{ marginTop: 6 }}>
          <button
            onClick={goMonitoring}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "0px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "linear-gradient(135deg, rgba(30,58,138,0.08) 0%, rgba(54,133,252,0.08) 100%)",
            }}
            title="Layar monitoring (read-only)"
          >
            <span aria-hidden="true" style={{ display: "inline-flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5.5C4 4.67 4.67 4 5.5 4h13C19.33 4 20 4.67 20 5.5v8.5c0 .83-.67 1.5-1.5 1.5h-13C4.67 16 4 15.33 4 14.5V5.5Z"
                  stroke="#1e3a8a"
                  strokeWidth="2"
                />
                <path d="M8 20h8" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 16v4" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            {getRoleLabel(MONITORING_ROLE)}
          </button>
        </div>
      </div>
    </div>
  );
}
