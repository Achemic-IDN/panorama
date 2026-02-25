/**
 * Duration calculation utilities for PANORAMA queue system
 * All durations are stored in seconds
 */

/**
 * Calculate duration in seconds between two dates
 * @param {Date | string | null} startDate - Start timestamp
 * @param {Date | string | null} endDate - End timestamp
 * @returns {number | null} Duration in seconds, or null if dates are invalid
 */
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 1000);
}

/**
 * Format duration in seconds to human-readable format
 * @param {number | null} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "02:15" or "1j 30m")
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds < 0) {
    return "-";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }

  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Format duration for live timer display (MM:SS or HH:MM:SS)
 * @param {number | null} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatLiveTimer(seconds) {
  if (seconds === null || seconds === undefined || seconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Calculate current duration from start timestamp (for live timers)
 * @param {Date | string | null} startDate - Start timestamp
 * @returns {number} Current duration in seconds
 */
export function calculateCurrentDuration(startDate) {
  if (!startDate) {
    return 0;
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    return 0;
  }

  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Get stage duration from queue record
 * @param {object} queue - Queue record from database
 * @param {string} stage - Stage name (ENTRY, TRANSPORT, PACKAGING, PENYERAHAN)
 * @returns {number | null} Duration in seconds
 */
export function getStageDuration(queue, stage) {
  switch (stage) {
    case 'ENTRY':
      return queue.durationEntry ?? null;
    case 'TRANSPORT':
      return queue.durationTransport ?? null;
    case 'PACKAGING':
      return queue.durationPackaging ?? null;
    case 'PENYERAHAN':
      return queue.durationPenyerahan ?? null;
    default:
      return null;
  }
}

/**
 * Get total duration from queue record
 * @param {object} queue - Queue record from database
 * @returns {number | null} Total duration in seconds
 */
export function getTotalDuration(queue) {
  return queue.durationTotal ?? null;
}

/**
 * Get start timestamp for current stage
 * @param {object} queue - Queue record from database
 * @param {string} status - Current queue status
 * @returns {Date | null} Start timestamp for current stage
 */
export function getCurrentStageStart(queue, status) {
  switch (status) {
    case 'ENTRY':
      return queue.entryStartAt ?? queue.entryAt ?? null;
    case 'TRANSPORT':
      return queue.transportStartAt ?? queue.transportAt ?? null;
    case 'PACKAGING':
      return queue.packagingStartAt ?? queue.packagingAt ?? null;
    case 'PENYERAHAN':
      return queue.penyerahanStartAt ?? queue.readyAt ?? null;
    case 'SELESAI':
      return queue.completedAt ?? null;
    default:
      return queue.createdAt;
  }
}

/**
 * Calculate average duration from array of durations
 * @param {number[]} durations - Array of durations in seconds
 * @returns {number | null} Average duration in seconds, or null if array is empty
 */
export function calculateAverageDuration(durations) {
  if (!Array.isArray(durations) || durations.length === 0) {
    return null;
  }

  const validDurations = durations.filter(d => d !== null && d !== undefined && d >= 0);
  if (validDurations.length === 0) {
    return null;
  }

  const sum = validDurations.reduce((acc, d) => acc + d, 0);
  return Math.floor(sum / validDurations.length);
}
