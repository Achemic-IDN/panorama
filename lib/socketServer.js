/**
 * Socket.io server instance for PANORAMA queue system
 * 
 * Handles real-time updates across all admin dashboards:
 * - ENTRY, TRANSPORT, PACKAGING, PENYERAHAN, UTAMA
 * - Patient dashboard updates
 * 
 * Events:
 * - QUEUE_CREATED: New queue created
 * - QUEUE_UPDATED: Queue data updated
 * - QUEUE_MOVED_STAGE: Queue moved to next stage
 * - QUEUE_COMPLETED: Queue finished (SELESAI)
 */

import { Server } from 'socket.io';
import { createServer } from 'http';

const globalForSocket = globalThis;

// Store io instance globally to prevent recreation
let io = null;

// Room names
export const ROOMS = {
  UTAMA: 'admin:UTAMA',
  ENTRY: 'admin:ENTRY',
  TRANSPORT: 'admin:TRANSPORT',
  PACKAGING: 'admin:PACKAGING',
  PENYERAHAN: 'admin:PENYERAHAN',
  PATIENT: (queueNumber) => `patient:${queueNumber}`,
};

// Get or create Socket.io server
export function getSocketServer() {
  if (io) {
    return io;
  }

  // If we're in a serverless environment (Vercel/Next.js API routes),
  // we can't maintain a persistent socket server easily
  // Fall back to SSE-based approach in such environments
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    setupSocketHandlers(io);
    httpServer.listen(3001, () => {
      console.log('Socket.io server running on port 3001');
    });
  }

  globalForSocket.__socketIO = io;
  return io;
}

// Setup socket event handlers
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join role-based room
    socket.on('join:role', (role) => {
      const room = getRoleRoom(role);
      if (room) {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      }
    });

    // Join patient-specific room
    socket.on('join:patient', (queueNumber) => {
      const room = ROOMS.PATIENT(queueNumber);
      socket.join(room);
      console.log(`Socket ${socket.id} joined patient room: ${room}`);
    });

    // Leave role room
    socket.on('leave:role', (role) => {
      const room = getRoleRoom(role);
      if (room) {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      }
    });

    // Leave patient room
    socket.on('leave:patient', (queueNumber) => {
      const room = ROOMS.PATIENT(queueNumber);
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

// Get room name for role
function getRoleRoom(role) {
  switch (role) {
    case 'UTAMA':
      return ROOMS.UTAMA;
    case 'ENTRY':
      return ROOMS.ENTRY;
    case 'TRANSPORT':
      return ROOMS.TRANSPORT;
    case 'PACKAGING':
      return ROOMS.PACKAGING;
    case 'PENYERAHAN':
      return ROOMS.PENYERAHAN;
    default:
      return null;
  }
}

// Get status to room mapping
function getRoomsForStatus(status) {
  const rooms = [ROOMS.UTAMA]; // UTAMA sees all
  
  switch (status) {
    case 'MENUNGGU':
      rooms.push(ROOMS.ENTRY);
      break;
    case 'ENTRY':
      rooms.push(ROOMS.ENTRY, ROOMS.TRANSPORT);
      break;
    case 'TRANSPORT':
      rooms.push(ROOMS.TRANSPORT, ROOMS.PACKAGING);
      break;
    case 'PACKAGING':
      rooms.push(ROOMS.PACKAGING, ROOMS.PENYERAHAN);
      break;
    case 'PENYERAHAN':
      rooms.push(ROOMS.PENYERAHAN);
      break;
    case 'SELESAI':
    case 'CANCELLED':
      // Only UTAMA sees completed/cancelled
      break;
  }
  
  return rooms;
}

// Broadcast queue created event
export function broadcastQueueCreated(queue) {
  if (!io) return;
  
  const event = {
    type: 'QUEUE_CREATED',
    data: queue,
    timestamp: new Date().toISOString(),
  };
  
  // All admins see new queues
  io.to(ROOMS.UTAMA).emit('queue:created', event);
}

// Broadcast queue updated event
export function broadcastQueueUpdated(queue) {
  if (!io) return;
  
  const event = {
    type: 'QUEUE_UPDATED',
    data: queue,
    timestamp: new Date().toISOString(),
  };
  
  const rooms = getRoomsForStatus(queue.status);
  rooms.forEach(room => {
    io.to(room).emit('queue:updated', event);
  });
}

// Broadcast queue moved stage event
export function broadcastQueueMovedStage(queue, previousStatus) {
  if (!io) return;
  
  const event = {
    type: 'QUEUE_MOVED_STAGE',
    data: {
      ...queue,
      previousStatus,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Send to old status rooms
  const oldRooms = getRoomsForStatus(previousStatus);
  oldRooms.forEach(room => {
    io.to(room).emit('queue:moved', event);
  });
  
  // Send to new status rooms
  const newRooms = getRoomsForStatus(queue.status);
  newRooms.forEach(room => {
    io.to(room).emit('queue:moved', event);
  });
  
  // Notify patient
  if (queue.queue) {
    io.to(ROOMS.PATIENT(queue.queue)).emit('queue:moved', event);
  }
}

// Broadcast queue completed event
export function broadcastQueueCompleted(queue) {
  if (!io) return;
  
  const event = {
    type: 'QUEUE_COMPLETED',
    data: queue,
    timestamp: new Date().toISOString(),
  };
  
  io.to(ROOMS.UTAMA).emit('queue:completed', event);
  
  // Notify patient
  if (queue.queue) {
    io.to(ROOMS.PATIENT(queue.queue)).emit('queue:completed', event);
  }
}

/**
 * Broadcast patient notification (Socket.io).
 * Emitted to:
 * - patient:{queueNumber} room (if queueNumber provided)
 * - admin:UTAMA room (monitoring)
 */
export function broadcastPatientNotification({ queueId, queueNumber, stage, message, createdAt }) {
  if (!io) return;
  if (!queueId || !stage || !message) return;

  const event = {
    type: "PATIENT_NOTIFICATION",
    data: {
      queueId,
      queueNumber: queueNumber ?? null,
      stage,
      message,
      createdAt: createdAt ?? new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  io.to(ROOMS.UTAMA).emit("patient:notification", event);
  if (queueNumber) {
    io.to(ROOMS.PATIENT(queueNumber)).emit("patient:notification", event);
  }
}

// Main broadcast function that dispatches to appropriate handlers
export function broadcastQueueEvent(queue, eventType, previousStatus = null) {
  // Lazy-initialize socket server on first broadcast in Node.js runtime.
  // In serverless/edge runtimes this will be a no-op and io will remain null.
  if (!io) {
    try {
      getSocketServer();
    } catch (error) {
      console.error("Failed to initialize Socket.io server:", error);
    }
  }

  if (!io) {
    // If still not available (e.g., edge runtime), silently skip websocket broadcast.
    return;
  }

  switch (eventType) {
    case 'QUEUE_CREATED':
      broadcastQueueCreated(queue);
      break;
    case 'QUEUE_UPDATED':
      broadcastQueueUpdated(queue);
      break;
    case 'QUEUE_MOVED_STAGE':
      broadcastQueueMovedStage(queue, previousStatus);
      break;
    case 'QUEUE_COMPLETED':
      broadcastQueueCompleted(queue);
      break;
    default:
      broadcastQueueUpdated(queue);
  }
}

// Export for use in serverless environments (falls back to SSE)
export default {
  getSocketServer,
  broadcastQueueCreated,
  broadcastQueueUpdated,
  broadcastQueueMovedStage,
  broadcastQueueCompleted,
  broadcastPatientNotification,
  broadcastQueueEvent,
  ROOMS,
};
