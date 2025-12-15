export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h1 style={{ margin: 0, fontSize: "28px" }}>PANORAMA</h1>
          <p style={{ margin: "5px 0", color: "#555" }}>
            Pelacakan Antrian Obat
          </p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "14px" }}>Nomor Antrean</label>
          <input
            type="text"
            placeholder="Contoh: A012"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "14px" }}>Nomor Rekam Medis</label>
          <input
            type="text"
            placeholder="Contoh: 12345678"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Button */}
        <button
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Masuk Dashboard
        </button>

        {/* Info */}
        <p
          style={{
            marginTop: "15px",
            fontSize: "12px",
            color: "#777",
            textAlign: "center",
          }}
        >
          Data digunakan hanya untuk verifikasi status obat pasien
        </p>
      </div>
    </main>
  );
}
