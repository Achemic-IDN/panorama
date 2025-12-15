export default function LoginPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>Login Pasien</h1>
      <p>Halaman Login PANORAMA</p>

      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Nomor Antrean"
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <br />
        <input
          placeholder="Nomor Rekam Medis"
          style={{ padding: "10px", width: "250px" }}
        />
      </div>
    </main>
  );
}
