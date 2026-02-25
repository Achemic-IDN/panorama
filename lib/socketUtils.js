import {
  QUEUE_EVENTS,
  broadcastQueueUpdate as broadcastSseUpdate,
  broadcastQueueCreated as broadcastSseCreated,
  broadcastQueueMovedStage as broadcastSseMoved,
  broadcastQueueCompleted as broadcastSseCompleted,
  broadcastPatientNotification as broadcastSsePatientNotification,
} from "@/lib/realtime";

import {
  broadcastQueueEvent as broadcastSocketEvent,
  broadcastPatientNotification as broadcastSocketPatientNotification,
} from "@/lib/socketServer";

/**
 * Internal helper to call a broadcaster in a best-effort way.
 * Realtime is non-critical; failures should not break request flow.
 */
function safeBroadcast(fn, ...args) {
  if (typeof fn !== "function") return;
  try {
    fn(...args);
  } catch (error) {
    console.error("Realtime broadcast failed:", error);
  }
}

/**
 * Emit generic queue update (non-stage-specific changes).
 * Uses:
 * - SSE: QUEUE_UPDATED
 * - WebSocket: QUEUE_UPDATED
 */
export function emitQueueUpdated(queue) {
  if (!queue) return;

  safeBroadcast(broadcastSseUpdate, queue, QUEUE_EVENTS.UPDATED);
  safeBroadcast(broadcastSocketEvent, queue, QUEUE_EVENTS.UPDATED, null);
}

/**
 * Emit queue created event.
 * Uses:
 * - SSE: QUEUE_CREATED
 * - WebSocket: QUEUE_CREATED
 */
export function emitQueueCreated(queue) {
  if (!queue) return;

  safeBroadcast(broadcastSseCreated, queue);
  safeBroadcast(broadcastSocketEvent, queue, QUEUE_EVENTS.CREATED, null);
}

/**
 * Emit queue moved stage event.
 * Uses:
 * - SSE: QUEUE_MOVED_STAGE (with previousStatus)
 * - WebSocket: QUEUE_MOVED_STAGE (with previousStatus)
 */
export function emitQueueMovedStage(queue, previousStatus) {
  if (!queue) return;

  safeBroadcast(broadcastSseMoved, queue, previousStatus ?? null);
  safeBroadcast(
    broadcastSocketEvent,
    queue,
    QUEUE_EVENTS.MOVED_STAGE,
    previousStatus ?? null
  );
}

/**
 * Emit queue completed event.
 * Uses:
 * - SSE: QUEUE_COMPLETED
 * - WebSocket: QUEUE_COMPLETED
 */
export function emitQueueCompleted(queue) {
  if (!queue) return;

  safeBroadcast(broadcastSseCompleted, queue);
  safeBroadcast(broadcastSocketEvent, queue, QUEUE_EVENTS.COMPLETED, null);
}

/**
 * Emit patient notification event (best-effort).
 * This does not change any existing UI behavior unless clients subscribe to it.
 */
export function emitPatientNotification({ queueId, queueNumber, stage, message, createdAt }) {
  if (!queueId || !stage || !message) return;

  safeBroadcast(broadcastSsePatientNotification, {
    queueId,
    queueNumber,
    stage,
    message,
    createdAt,
  });
  safeBroadcast(broadcastSocketPatientNotification, {
    queueId,
    queueNumber,
    stage,
    message,
    createdAt,
  });
}

export { QUEUE_EVENTS };

