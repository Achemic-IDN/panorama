"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocketClient } from "@/lib/socketClient";
import { escapeHtml } from "@/lib/utils";

const STAGE_LABEL = {
  MENUNGGU: "Entry",
  ENTRY: "Entry",
  TRANSPORT: "Transport",
  PACKAGING: "Packaging",
  PENYERAHAN: "Penyerahan",
};

function formatClock(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getKeterangan(status) {
  if (status === "SELESAI") return "Selesai";
  if (status === "CANCELLED") return "Batal";
  return "Sedang diproses";
}

export default function MonitorPage() {
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [recentlyChanged, setRecentlyChanged] = useState(() => new Map());
  const scrollRef = useRef(null);

  async function loadInitial() {
    setError("");
    try {
      const res = await fetch("/api/monitor/queues", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message || "Gagal memuat antrean");
        return;
      }
      const list = Array.isArray(json.data?.queues) ? json.data.queues : [];
      setQueues(list);
    } catch (e) {
      setError("Gagal terhubung ke server");
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  // clock (bonus)
  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  // auto-scroll (bonus)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let dir = 1;
    const id = setInterval(() => {
      if (!scrollRef.current) return;
      const node = scrollRef.current;
      if (node.scrollHeight <= node.clientHeight) return;

      node.scrollTop += dir * 1;
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 2) dir = -1;
      if (node.scrollTop <= 0) dir = 1;
    }, 25);
    return () => clearInterval(id);
  }, [queues]);

  // realtime via socket.io
  useEffect(() => {
    const client = getSocketClient();
    client.connect("MONITORING");

    const upsert = (updated) => {
      const q = updated?.data || updated;
      if (!q?.id) return;

      setRecentlyChanged((prev) => {
        const next = new Map(prev);
        next.set(q.id, Date.now());
        return next;
      });

      setQueues((prev) => {
        const idx = prev.findIndex((x) => x.id === q.id);
        // remove if no longer active
        if (q.status === "SELESAI" || q.status === "CANCELLED") {
          if (idx === -1) return prev;
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        }

        if (idx === -1) return [q, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...q };
        return next;
      });
    };

    const offGeneric = client.on("queue:update", upsert);
    const offUpdated = client.on("queue:updated", upsert);
    const offMoved = client.on("queue:moved", upsert);
    const offCreated = client.on("queue:created", upsert);
    const offCompleted = client.on("queue:completed", upsert);

    // polling fallback hook
    const offPolled = client.on("queue:polled", (payload) => {
      const list = Array.isArray(payload?.queues) ? payload.queues : [];
      // keep only active
      setQueues(list.filter((x) => x.status !== "SELESAI" && x.status !== "CANCELLED"));
    });

    return () => {
      offGeneric();
      offUpdated();
      offMoved();
      offCreated();
      offCompleted();
      offPolled();
      // keep singleton alive
    };
  }, []);

  // highlight cleanup (bonus)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setRecentlyChanged((prev) => {
        if (!prev.size) return prev;
        const next = new Map(prev);
        for (const [k, ts] of next.entries()) {
          if (now - ts > 2500) next.delete(k);
        }
        return next;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  const activeQueues = useMemo(() => {
    const list = Array.isArray(queues) ? [...queues] : [];
    // show newest first on screen, while API uses ASC for stability
    return list.sort((a, b) => {
      const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bt - at;
    });
  }, [queues]);

  const top = activeQueues[0] || null;
  const rest = activeQueues.slice(1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e7eefc",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        padding: "28px 36px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0.2 }}>
          Layar Monitoring Antrean
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.95 }}>{clock}</div>
      </header>

      {error && (
        <div
          style={{
            marginTop: 18,
            background: "rgba(220,53,69,0.15)",
            border: "1px solid rgba(220,53,69,0.35)",
            color: "#ffd7dc",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 18,
          }}
        >
          {error}
        </div>
      )}

      {/* Top queue (paling besar) */}
      <section style={{ marginTop: 22 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 18,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: "22px 26px",
              background: "linear-gradient(135deg, rgba(54,133,252,0.22) 0%, rgba(30,58,138,0.22) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 180,
            }}
          >
            <div style={{ fontSize: 18, opacity: 0.85, fontWeight: 700 }}>Nomor antrean saat ini</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 92,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              {top ? escapeHtml(top.queue) : "-"}
            </div>
            <div style={{ marginTop: 10, fontSize: 22, opacity: 0.92 }}>
              {top?.patientName ? (
                <span>Pasien: <strong>{escapeHtml(top.patientName)}</strong></span>
              ) : (
                <span>Pasien: <strong>-</strong></span>
              )}
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "22px 26px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 180,
            }}
          >
            <div style={{ fontSize: 18, opacity: 0.85, fontWeight: 700 }}>Status</div>
            <div style={{ marginTop: 10, fontSize: 38, fontWeight: 900 }}>
              {top ? (STAGE_LABEL[top.status] || top.status) : "-"}
            </div>
            <div style={{ marginTop: 10, fontSize: 22, opacity: 0.9 }}>
              {top ? getKeterangan(top.status) : "-"}
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section style={{ marginTop: 22 }}>
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.9 }}>
              Daftar antrean aktif ({activeQueues.length})
            </div>
          </div>

          <div ref={scrollRef} style={{ maxHeight: "calc(100vh - 420px)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: "rgba(11,18,32,0.95)", backdropFilter: "blur(6px)" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 18, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Nomor Antrean
                  </th>
                  <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 18, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Nama Pasien
                  </th>
                  <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 18, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Status Saat Ini
                  </th>
                  <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 18, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "18px", fontSize: 18, opacity: 0.8 }}>
                      Tidak ada antrean aktif.
                    </td>
                  </tr>
                ) : (
                  rest.map((q) => {
                    const highlight = recentlyChanged.has(q.id);
                    return (
                      <tr
                        key={q.id}
                        style={{
                          background: highlight ? "rgba(255, 193, 7, 0.14)" : "transparent",
                          transition: "background 300ms ease",
                        }}
                      >
                        <td style={{ padding: "16px 18px", fontSize: 28, fontWeight: 900 }}>
                          {escapeHtml(q.queue)}
                        </td>
                        <td style={{ padding: "16px 18px", fontSize: 20, fontWeight: 700, opacity: 0.95 }}>
                          {q.patientName ? escapeHtml(q.patientName) : "-"}
                        </td>
                        <td style={{ padding: "16px 18px", fontSize: 20, fontWeight: 800 }}>
                          {STAGE_LABEL[q.status] || q.status}
                        </td>
                        <td style={{ padding: "16px 18px", fontSize: 20, opacity: 0.95 }}>
                          {getKeterangan(q.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

