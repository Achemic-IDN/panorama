"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ padding: "60px", textAlign: "center", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "36px" }}>PANORAMA</h1>
      <p style={{ marginBottom: "40px", color: "#555" }}>
        Pelacakan Antrian Obat Real-time Mandiri
      </p>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            padding: "14px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login Pasien
        </button>

        <button
          onClick={() => router.push("/admin/login")}
          style={{
            padding: "14px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login Admin
        </button>
      </div>
    </main>
  );
}
