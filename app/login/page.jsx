export default function LoginPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to bottom, #2563eb, #3b82f6)",
      fontFamily: "Arial"
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px" }}>
          PANORAMA
        </h1>

        <p style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#555",
          marginBottom: "24px"
        }}>
          Login Dashboard Pasien
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px" }}>Nomor Antrean</label>
          <input
            placeholder="Contoh: A012"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "14px" }}>Nomor Rekam Medis</label>
          <input
            placeholder="Contoh: 12345678"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <button style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: "#2563eb",
          color: "white",
          fontSize: "16px",
          cursor: "pointer"
        }}>
          Masuk Dashboard
        </button>

        <p style={{
          marginTop: "16px",
          fontSize: "12px",
          textAlign: "center",
          color: "#777"
        }}>
          Data digunakan hanya untuk verifikasi status obat pasien
        </p>
      </div>
    </main>
  );
}
