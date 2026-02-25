"use client";

import { useState, useEffect } from "react";
import { formatLiveTimer, calculateCurrentDuration } from "@/lib/durationUtils";

/**
 * LiveTimer - Displays a live countdown timer from a start timestamp
 * 
 * @param {Date|string|null} startTimestamp - When the timer should start from
 * @param {string} label - Label to display before the timer
 * @param {boolean} showSeconds - Whether to show seconds (default: true)
 * @param {string} className - Optional CSS class name
 */
export default function LiveTimer({ 
  startTimestamp, 
  label = "Duration:", 
  showSeconds = true,
  className = "" 
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startTimestamp) {
      setSeconds(0);
      return;
    }

    // Calculate initial seconds
    setSeconds(calculateCurrentDuration(startTimestamp));

    // Update every second
    const interval = setInterval(() => {
      setSeconds(calculateCurrentDuration(startTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  const formattedTime = formatLiveTimer(seconds);

  return (
    <span className={className} style={{ fontFamily: "monospace", fontWeight: 600 }}>
      {label} {formattedTime}
    </span>
  );
}

/**
 * StageTimer - Shows time spent in current stage
 * 
 * @param {object} queue - Queue record from database
 * @param {string} currentStatus - Current queue status
 */
export function StageTimer({ queue, currentStatus }) {
  if (!queue || !currentStatus) return null;

  // Get the appropriate start timestamp based on current status
  let startTimestamp = null;
  let label = "";

  switch (currentStatus) {
    case "ENTRY":
      startTimestamp = queue.entryStartAt || queue.entryAt;
      label = "Entry Time:";
      break;
    case "TRANSPORT":
      startTimestamp = queue.transportStartAt || queue.transportAt;
      label = "Transport Time:";
      break;
    case "PACKAGING":
      startTimestamp = queue.packagingStartAt || queue.packagingAt;
      label = "Packaging Time:";
      break;
    case "PENYERAHAN":
      startTimestamp = queue.penyerahanStartAt || queue.readyAt;
      label = "Penyerahan Time:";
      break;
    case "SELESAI":
      // Show final duration if completed
      if (queue.durationTotal) {
        const mins = Math.floor(queue.durationTotal / 60);
        const secs = queue.durationTotal % 60;
        return (
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#155724" }}>
            Total Time: {mins}m {secs}s
          </span>
        );
      }
      return null;
    default:
      // For MENUNGGU, show wait time from creation
      startTimestamp = queue.createdAt;
      label = "Waiting:";
  }

  if (!startTimestamp) return null;

  return (
    <LiveTimer 
      startTimestamp={startTimestamp} 
      label={label}
      className="stage-timer"
    />
  );
}

/**
 * TotalTimer - Shows total time from creation to now (or completion)
 * 
 * @param {object} queue - Queue record from database
 */
export function TotalTimer({ queue }) {
  if (!queue) return null;

  // If completed, show total duration
  if (queue.status === "SELESAI" && queue.durationTotal) {
    const mins = Math.floor(queue.durationTotal / 60);
    const secs = queue.durationTotal % 60;
    return (
      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#155724" }}>
        Total: {mins}m {secs}s
      </span>
    );
  }

  // Otherwise show live timer from creation
  return (
    <LiveTimer 
      startTimestamp={queue.createdAt} 
      label="Total:"
      className="total-timer"
    />
  );
}
