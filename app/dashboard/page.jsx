import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("panorama_session");

  // ❌ BELUM LOGIN
  if (!session) {
    redirect("/login");
  }

  // ✅ SUDAH LOGIN
  const nomorAntrean = session.value;

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard PANORAMA</h1>
      <p>Selamat datang, nomor antrean:</p>
      <h2>{nomorAntrean}</h2>

      <h3>Status Resep</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Entry</td><td>Selesai</td></tr>
          <tr><td>Transport</td><td>Proses</td></tr>
          <tr><td>Pengemasan</td><td>Menunggu</td></tr>
          <tr><td>Siap Diambil</td><td>-</td></tr>
        </tbody>
      </table>

      <br />
      <form action="/logout" method="POST">
        <button>Logout</button>
      </form>
    </main>
  );
}
