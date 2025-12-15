"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px" }}>PANORAMA</h1>

      <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
        (VERSI TEST ONLINE)
      </p>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        Pelacakan Antrian Obat Real-time Mandiri
      </p>

      <button
        onClick={() => router.push("/login")}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Masuk Login Pasien
      </button>
    </main>
  );
}
