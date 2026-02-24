const globalForRealtime = globalThis;

if (!globalForRealtime.__queueSseClients) {
  globalForRealtime.__queueSseClients = new Set();
}

const clients = globalForRealtime.__queueSseClients;

export function addClient(controller) {
  clients.add(controller);
}

export function removeClient(controller) {
  clients.delete(controller);
}

export function broadcastQueueUpdate(queue) {
  if (!queue) return;

  const payload = JSON.stringify({
    id: queue.id,
    queue: queue.queue,
    mrn: queue.mrn,
    status: queue.status,
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

