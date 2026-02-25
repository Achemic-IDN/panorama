const globalForRealtime = globalThis;

if (!globalForRealtime.__queueSseClients) {
  globalForRealtime.__queueSseClients = new Set();
}

const clients = globalForRealtime.__queueSseClients;

// Event types
export const QUEUE_EVENTS = {
  CREATED: 'QUEUE_CREATED',
  UPDATED: 'QUEUE_UPDATED',
  MOVED_STAGE: 'QUEUE_MOVED_STAGE',
  COMPLETED: 'QUEUE_COMPLETED',
};

// Additional event types (kept in same SSE channel for compatibility)
export const PATIENT_EVENTS = {
  NOTIFICATION: "PATIENT_NOTIFICATION",
};

export function addClient(controller) {
  clients.add(controller);
}

export function removeClient(controller) {
  clients.delete(controller);
}

/**
 * Broadcast queue update to all connected SSE clients
 * @param {object} queue - Queue record
 * @param {string} eventType - Event type (QUEUE_CREATED, QUEUE_UPDATED, etc.)
 * @param {string} previousStatus - Previous status for MOVED_STAGE events
 */
export function broadcastQueueUpdate(queue, eventType = QUEUE_EVENTS.UPDATED, previousStatus = null) {
  if (!queue) return;

  const payload = JSON.stringify({
    id: queue.id,
    queue: queue.queue,
    mrn: queue.mrn,
    status: queue.status,
    eventType,
    previousStatus,
    // Include duration fields
    durationEntry: queue.durationEntry,
    durationTransport: queue.durationTransport,
    durationPackaging: queue.durationPackaging,
    durationPenyerahan: queue.durationPenyerahan,
    durationTotal: queue.durationTotal,
    // Include timestamp fields
    entryAt: queue.entryAt,
    entryStartAt: queue.entryStartAt,
    entryEndAt: queue.entryEndAt,
    transportAt: queue.transportAt,
    transportStartAt: queue.transportStartAt,
    transportEndAt: queue.transportEndAt,
    packagingAt: queue.packagingAt,
    packagingStartAt: queue.packagingStartAt,
    packagingEndAt: queue.packagingEndAt,
    readyAt: queue.readyAt,
    penyerahanStartAt: queue.penyerahanStartAt,
    penyerahanEndAt: queue.penyerahanEndAt,
    completedAt: queue.completedAt,
    createdAt: queue.createdAt,
    updatedAt: queue.updatedAt,
  });

  const message = `data: ${payload}\n\n`;

  for (const controller of Array.from(clients)) {
    try {
      controller.enqueue(message);
    } catch (error) {
      console.error("Failed to push SSE to client, removing:", error);
      clients.delete(controller);
    }
  }
}

/**
 * Broadcast queue created event
 */
export function broadcastQueueCreated(queue) {
  broadcastQueueUpdate(queue, QUEUE_EVENTS.CREATED);
}

/**
 * Broadcast queue moved stage event
 */
export function broadcastQueueMovedStage(queue, previousStatus) {
  broadcastQueueUpdate(queue, QUEUE_EVENTS.MOVED_STAGE, previousStatus);
}

/**
 * Broadcast queue completed event
 */
export function broadcastQueueCompleted(queue) {
  broadcastQueueUpdate(queue, QUEUE_EVENTS.COMPLETED);
}

/**
 * Broadcast patient notification event (SSE).
 * This is sent on the same SSE stream but without an `id`,
 * so existing dashboards that only process payloads with `id` won't break.
 */
export function broadcastPatientNotification({
  queueId,
  queueNumber,
  stage,
  message,
  createdAt,
}) {
  if (!queueId || !stage || !message) return;

  const payload = JSON.stringify({
    eventType: PATIENT_EVENTS.NOTIFICATION,
    queueId,
    queueNumber: queueNumber ?? null,
    stage,
    message,
    createdAt: createdAt ?? new Date().toISOString(),
  });

  const sseMessage = `data: ${payload}\n\n`;

  for (const controller of Array.from(clients)) {
    try {
      controller.enqueue(sseMessage);
    } catch (error) {
      console.error("Failed to push SSE patient notification, removing:", error);
      clients.delete(controller);
    }
  }
}
