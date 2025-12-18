"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((res) => res.json())
      .then(setFeedbacks);
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Admin PANORAMA</h1>

      <h3 style={{ marginTop: "30px" }}>Feedback Pasien</h3>

      {feedbacks.length === 0 && <p>Belum ada feedback</p>}

      {feedbacks.map((f, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p><strong>Antrean:</strong> {f.queue}</p>
          <p><strong>Waktu:</strong> {f.time}</p>
          <p>{f.message}</p>
        </div>
      ))}
    </main>
  );
}
