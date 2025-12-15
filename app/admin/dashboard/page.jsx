export default function AdminDashboard() {
  const antrean = [
    { nomor: "A001", status: "Packaging" },
    { nomor: "A002", status: "Transport" },
    { nomor: "A003", status: "Ready" },
  ];

  const feedback = [
    { nomor: "A001", pesan: "Pelayanan cepat" },
    { nomor: "A002", pesan: "Ruang tunggu nyaman" },
  ];

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard Admin PANORAMA</h1>

      <h2>Status Antrean</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Nomor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {antrean.map((a) => (
            <tr key={a.nomor}>
              <td>{a.nomor}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 40 }}>Feedback Pasien</h2>
      <ul>
        {feedback.map((f, i) => (
          <li key={i}>
            <b>{f.nomor}:</b> {f.pesan}
          </li>
        ))}
      </ul>
    </main>
  );
}
