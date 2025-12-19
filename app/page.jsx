"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #86efac 0%, #ffffff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      color: "#333"
    }}>
      <main style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.1)",
        padding: "60px",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        backdropFilter: "blur(10px)"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px", fontWeight: "bold" }}>PANORAMA</h1>
        <p style={{ marginBottom: "40px", fontSize: "18px", opacity: 0.9 }}>
          Pelacakan Antrian Obat Real-time Mandiri
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "16px 32px",
              fontSize: "18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.3)";
            }}
          >
            Login Pasien
          </button>

          <button
            onClick={() => router.push("/admin/login")}
            style={{
              padding: "16px 32px",
              fontSize: "18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.3)";
            }}
          >
            Login Admin
          </button>
        </div>
      </main>
    </div>
  );
}
