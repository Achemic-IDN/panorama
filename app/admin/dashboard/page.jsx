"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then(setFeedbacks);
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Admin PANORAMA</h1>
      <p>Daftar feedback pasien</p>

      <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Nomor Antrean</th>
            <th>MRN</th>
            <th>Feedback</th>
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
