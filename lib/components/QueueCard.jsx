"use client";

import StatusBadge from "./StatusBadge";
import ProgressTracker from "./ProgressTracker";
import { StageTimer, TotalTimer } from "./LiveTimer";
import { escapeHtml } from "@/lib/utils";

/**
 * QueueCard - Displays queue information with live timers
 * 
 * @param {object} queue - Queue record from database
 * @param {function} onAdvance - Callback when "Proses" button is clicked
 * @param {boolean} isLoading - Whether the card is in loading state
 * @param {boolean} showAdvanceButton - Whether to show advance button
 * @param {string} advanceButtonLabel - Label for advance button
 */
export default function QueueCard({ 
  queue, 
  onAdvance, 
  isLoading = false,
  showAdvanceButton = true,
  advanceButtonLabel = "Proses"
}) {
  if (!queue) return null;

  const isTerminal = queue.status === "SELESAI" || queue.status === "CANCELLED";

  return (
    <div style={{
      padding: 16,
      borderRadius: 10,
      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.03)'
    }}>
      {/* Header: Queue Number and Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#1e3a8a' }}>{escapeHtml(queue.queue)}</div>
          <div style={{ color: '#666', marginTop: 6 }}>MRN: <strong>{escapeHtml(queue.mrn)}</strong></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={queue.status} />
        </div>
      </div>

      {/* Progress Tracker */}
      <div style={{ marginTop: 12 }}>
        <ProgressTracker status={queue.status} />
      </div>

      {/* Live Timers */}
      <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8f9fa', borderRadius: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <StageTimer queue={queue} currentStatus={queue.status} />
          <TotalTimer queue={queue} />
        </div>
      </div>

      {/* Stage Durations (if completed) */}
      {queue.status === "SELESAI" && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          {queue.durationEntry && <div>Entry: {formatDuration(queue.durationEntry)}</div>}
          {queue.durationTransport && <div>Transport: {formatDuration(queue.durationTransport)}</div>}
          {queue.durationPackaging && <div>Packaging: {formatDuration(queue.durationPackaging)}</div>}
          {queue.durationPenyerahan && <div>Penyerahan: {formatDuration(queue.durationPenyerahan)}</div>}
        </div>
      )}

      {/* Action Button */}
      {showAdvanceButton && !isTerminal && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="button"
            onClick={() => onAdvance && onAdvance(queue.id)}
            disabled={isLoading}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: isLoading ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 700
            }}
          >
            {isLoading ? 'Memproses...' : advanceButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "-";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(secs)}`;
}
