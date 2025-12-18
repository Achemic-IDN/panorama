"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (data.role !== "admin") {
        router.push("/admin/login");
        return;
      }
      // If admin, load feedbacks
      const feedbackRes = await fetch("/api/admin/feedback");
      const feedbackData = await feedbackRes.json();
      setFeedbacks(feedbackData);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
