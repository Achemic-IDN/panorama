"use client";

import { useState, useEffect } from "react";
import { getStatusLabel, isInProgressStatus } from "@/lib/status";
import { getSocketClient } from "@/lib/socketClient";
import { csrfFetch } from "@/lib/utils";

export default function DashboardPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [lastStatus, setLastStatus] = useState(null);
  const [statusChangeMessage, setStatusChangeMessage] = useState("");

  useEffect(() => {
    // Load patient data from cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const patientDataCookie = getCookie('patientData');
    if (patientDataCookie) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(patientDataCookie));
        setPatientData(parsedData);
        console.log("Patient data loaded:", parsedData);

        // Load patient login history using MRN
        async function loadHistory() {
          try {
            const res = await fetch(`/api/admin/patient-login?mrn=${parsedData.nomorRekamMedis}`);
            if (!res.ok) {
              console.error("Failed to fetch patient login history");
              return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
              // Transform patient login data to match expected format
              const transformedHistory = data.map(login => ({
                id: login.id,
                queue: login.nomorAntrean,
                status: login.statusAntrean,
                createdAt: login.waktuLogin
              }));
              setHistory(transformedHistory);
            } else {
              console.error("Invalid history data:", data);
            }
          } catch (err) {
            console.error("Error loading patient login history:", err);
          }
        }
        loadHistory();
      } catch (error) {
        console.error("Error parsing patient data:", error);
      }
    } else {
      console.error("No patient data found in cookie");
    }
  }, []);

  // Realtime update status antrean via SSE
  useEffect(() => {
    if (!patientData?.nomorAntrean || !patientData?.nomorRekamMedis) {
      return;
    }

    const source = new EventSource("/api/realtime/queue");

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          !data ||
          data.queue !== patientData.nomorAntrean ||
          data.mrn !== patientData.nomorRekamMedis
        ) {
          return;
        }

        const newStatus = data.status;

        setPatientData((prev) => {
          const previousStatus = prev?.statusAntrean;

          if (previousStatus && previousStatus !== newStatus) {
            setStatusChangeMessage(
              `Status antrean Anda berubah dari "${getStatusLabel(
                previousStatus
              )}" menjadi "${getStatusLabel(newStatus)}".`
            );
            setLastStatus(newStatus);
            setTimeout(() => {
              setStatusChangeMessage("");
            }, 6000);
          }

          return prev
            ? {
                ...prev,
                statusAntrean: newStatus,
                updatedAt: data.updatedAt || prev.updatedAt,
              }
            : prev;
        });
        setStatusError(null);
      } catch (e) {
        console.error("Invalid SSE queue data:", e);
      }
    };

    source.onerror = (err) => {
      console.error("SSE error (patient dashboard):", err);
      setStatusError("Koneksi realtime terputus, mencoba ulang otomatis...");
    };

    return () => {
      source.close();
    };
  }, [patientData?.nomorAntrean, patientData?.nomorRekamMedis]);

  // socket.io notifications for patient (fallback/polling handled internally)
  useEffect(() => {
    if (!patientData?.nomorAntrean) return;
    const client = getSocketClient();
    client.connect("patient", patientData.nomorAntrean);

    const offNotif = client.on("patient:notification", (evt) => {
      const data = evt?.data || evt;
      if (data && data.message) {
        setStatusChangeMessage(data.message);
        setTimeout(() => setStatusChangeMessage(""), 5000);
      }
    });

    return () => {
      offNotif();
    };
  }, [patientData?.nomorAntrean]);

  async function submitFeedback() {
    if (!patientData) {
      setError("Patient data not available");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await csrfFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queue: patientData.nomorAntrean,
          mrn: patientData.nomorRekamMedis,
          message,
          rating,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      setSent(true);
      setMessage("");
      setRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #3685fc 0%, #1e3a8a 100%)",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "800px",
        margin: "auto",
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Dashboard Pasien</h1>

        {statusChangeMessage && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "6px",
              background:
                lastStatus === "SELESAI"
                  ? "#d4edda"
                  : lastStatus === "CANCELLED"
                  ? "#f8d7da"
                  : isInProgressStatus(lastStatus)
                  ? "#cce5ff"
                  : "#fff3cd",
              color:
                lastStatus === "SELESAI"
                  ? "#155724"
                  : lastStatus === "CANCELLED"
                  ? "#721c24"
                  : isInProgressStatus(lastStatus)
                  ? "#004085"
                  : "#856404",
              border: "1px solid rgba(0,0,0,0.1)",
              fontSize: "14px",
            }}
          >
            {statusChangeMessage}
          </div>
        )}

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#555", marginBottom: "20px" }}>Informasi Pasien</h3>
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
              <p><strong>Nomor Antrean:</strong> {patientData ? patientData.nomorAntrean : "Loading..."}</p>
              <p><strong>Nomor MRN:</strong> {patientData ? patientData.nomorRekamMedis : "Loading..."}</p>
              <p>
                <strong>Status:</strong>{" "}
                {patientData ? getStatusLabel(patientData.statusAntrean) : "Loading..."}
              </p>
              {statusError && (
                <p style={{ marginTop: "8px", color: "red", fontSize: "14px" }}>
                  {statusError}
                </p>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#555", marginBottom: "20px" }}>Feedback Pelayanan</h3>

            {sent && <p style={{
              color: "green",
              background: "#d4edda",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px"
            }}>✔ Feedback terkirim</p>}

            {error && <p style={{
              color: "red",
              background: "#f8d7da",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px"
            }}>Error: {error}</p>}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis kritik atau saran..."
              style={{
                width: "100%",
                height: "100px",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box",
                marginBottom: "15px"
              }}
            />

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>Rating: </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              >
                <option value={1}>⭐ 1 Bintang</option>
                <option value={2}>⭐⭐ 2 Bintang</option>
                <option value={3}>⭐⭐⭐ 3 Bintang</option>
                <option value={4}>⭐⭐⭐⭐ 4 Bintang</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 Bintang</option>
              </select>
            </div>

            <button
              onClick={submitFeedback}
              disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#ccc" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => { if (!loading) e.target.style.transform = "scale(1.05)"; }}
            onMouseOut={(e) => { if (!loading) e.target.style.transform = "scale(1)"; }}
            >
              {loading ? "Mengirim..." : "Kirim Feedback"}
            </button>
          </div>
        </div>


      </main>
    </div>
  );
}
