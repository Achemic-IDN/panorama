# PANORAMA Realtime Queue System - Implementation Plan

## Current State Analysis

### Existing Architecture:
- **Database**: Prisma with PostgreSQL, Queue model has basic timestamps
- **Realtime**: SSE (Server-Sent Events) via `/api/realtime/queue`
- **Workflow**: Stage transitions via `queueWorkflowService.js`
- **Frontend**: Admin & Staff dashboards with SSE polling

### What's Missing:
1. Detailed stage timestamps (start/end for each stage)
2. Duration tracking for each stage
3. WebSocket implementation (Socket.io)
4. Role-based room subscriptions
5. Live timer display on frontend
6. Admin UTAMA monitoring stats with averages
7. Proper event types (QUEUE_CREATED, QUEUE_UPDATED, QUEUE_MOVED_STAGE, QUEUE_COMPLETED)

---

## Implementation Tasks

### Phase 1: Database Schema Updates
- [ ] 1.1 Update `prisma/schema.prisma` with new timestamp fields
  - Add entryStartAt, entryEndAt
  - Add transportStartAt, transportEndAt
  - Add packagingStartAt, packagingEndAt
  - Add penyerahanStartAt, penyerahanEndAt
  - Add durationEntry, durationTransport, durationPackaging, durationPenyerahan, durationTotal

### Phase 2: WebSocket Server Setup
- [ ] 2.1 Install socket.io and socket.io-client
- [ ] 2.2 Create WebSocket server instance (`lib/socketServer.js`)
- [ ] 2.3 Implement room-based subscriptions per role
- [ ] 2.4 Add event types: QUEUE_CREATED, QUEUE_UPDATED, QUEUE_MOVED_STAGE, QUEUE_COMPLETED

### Phase 3: Queue Workflow Service Updates
- [ ] 3.1 Update `lib/queueWorkflowService.js`
  - Add start timestamp when entering a stage
  - Add end timestamp when finishing a stage
  - Calculate duration for each stage
  - Calculate total duration when completed

### Phase 4: Realtime Broadcast Updates
- [ ] 4.1 Create `lib/socketUtils.js` for socket broadcasting
- [ ] 4.2 Update API routes to emit socket events
- [ ] 4.3 Add fallback polling mechanism

### Phase 5: Frontend Updates - Socket Client
- [ ] 5.1 Create `lib/socketClient.js` for client-side socket connection
- [ ] 5.2 Implement auto-reconnection logic
- [ ] 5.3 Add fallback to polling every 10 seconds

### Phase 6: Frontend Updates - Admin Dashboard
- [ ] 6.1 Update `app/admin/dashboard/page.jsx`
  - Integrate socket client
  - Add live timer display
  - Add stage duration display

### Phase 7: Frontend Updates - Staff Dashboard
- [ ] 7.1 Update `app/staff/dashboard/page.jsx`
  - Integrate socket client with role subscription
  - Add live timer display

### Phase 8: Frontend Updates - Patient Dashboard
- [ ] 8.1 Update `app/dashboard/page.jsx`
  - Keep existing functionality
  - Integrate socket client for status updates

### Phase 9: Live Timer Component
- [ ] 9.1 Create `lib/components/LiveTimer.jsx`
- [ ] 9.2 Create `lib/components/QueueCard.jsx` with timer display
- [ ] 9.3 Add status badge colors as specified

### Phase 10: Admin UTAMA Monitoring
- [ ] 10.1 Create stats API endpoint
- [ ] 10.2 Add monitoring dashboard with:
  - Total Antrian Hari Ini
  - Sedang Diproses
  - Selesai
  - Rata-rata Waktu Entry
  - Rata-rata Waktu Packaging
  - Rata-rata Total Pelayanan

### Phase 11: Security & Role Guards
- [ ] 11.1 Ensure only authorized roles can update their stage
- [ ] 11.2 Add middleware for socket authentication

---

## Technical Details

### Status Badge Colors:
- MENUNGGU = gray
- ENTRY = blue
- TRANSPORT = purple
- PACKAGING = orange
- PENYERAHAN = teal
- SELESAI = green

### Queue Workflow:
```
MENUNGGU → ENTRY → TRANSPORT → PACKAGING → PENYERAHAN → SELESAI
```

### WebSocket Events:
- `QUEUE_CREATED` - New queue created
- `QUEUE_UPDATED` - Queue data updated
- `QUEUE_MOVED_STAGE` - Queue moved to next stage
- `QUEUE_COMPLETED` - Queue finished (SELESAI)

### Rooms:
- `admin:UTAMA` - All queues
- `admin:ENTRY` - ENTRY stage queues
- `admin:TRANSPORT` - TRANSPORT stage queues
- `admin:PACKAGING` - PACKAGING stage queues
- `admin:PENYERAHAN` - PENYERAHAN stage queues
- `patient:{queueNumber}` - Individual patient updates
