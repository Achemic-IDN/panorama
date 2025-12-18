import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const cookie = cookies().get('auth');
  if (!cookie || cookie.value !== 'admin') {
    redirect('/admin/login');
  }

  const res = await fetch('/api/admin/feedback');
  const feedbacks = await res.json();

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Admin Panorama</h1>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Antrean</th>
            <th>MRN</th>
            <th>Pesan</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((f, i) => (
            <tr key={i}>
              <td>{f.queue}</td>
              <td>{f.mrn}</td>
              <td>{f.message}</td>
              <td>{new Date(f.time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
