export default function LoginPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial",
      backgroundColor: "#f4f6f8"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "360px",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px" }}>
          PANORAMA
        </h1>

        <p style={{
          textAlign: "center",
          color: "#555",
          marginBottom: "24px"
        }}>
          Login Pasien
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label>Nomor Antrean</label>
          <input
            type="text"
            placeholder="Contoh: A012"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Nomor Rekam Medis</label>
          <input
            type="text"
            placeholder="Contoh: 12345678"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Masuk
        </button>

        <p style={{
          fontSize: "12px",
          textAlign: "center",
          marginTop: "16px",
          color: "#777"
        }}>
          Digunakan hanya untuk melihat status obat pasien
        </p>
      </div>
    </main>
  );
}
