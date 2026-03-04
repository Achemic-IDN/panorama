# PANORAMA

## Sistem Manajemen Antrean dan Workflow Farmasi Rumah Sakit

---

## Daftar Isi

1. [Judul dan Ringkasan Sistem](#1-judul-dan-ringkasan-sistem)
2. [Latar Belakang Permasalahan](#2-latar-belakang-permasalahan)
3. [Tujuan Pengembangan Sistem](#3-tujuan-pengembangan-sistem)
4. [Ruang Lingkup Sistem](#4-ruang-lingkup-sistem)
5. [Fitur Utama](#5-fitur-utama)
6. [Arsitektur Sistem](#6-arsitektur-sistem)
7. [Diagram Alur Proses](#7-diagram-alur-proses)
8. [Struktur Folder Project](#8-struktur-folder-project)
9. [Desain Database](#9-desain-database)
10. [Role dan Hak Akses](#10-role-dan-hak-akses)
11. [Mekanisme Realtime](#11-mekanisme-realtime)
12. [Monitoring Screen](#12-monitoring-screen)
13. [Tracking Waktu dan Audit Log](#13-tracking-waktu-dan-audit-log)
14. [Instalasi dan Setup Lokal](#14-instalasi-dan-setup-lokal)
15. [Environment Variables](#15-environment-variables)
16. [Proses Migrasi Database](#16-proses-migrasi-database)
17. [Cara Deployment ke Vercel](#17-cara-deployment-ke-vercel)
18. [Strategi Keamanan dan Validasi](#18-strategi-keamanan-dan-validasi)
19. [Pengembangan Lanjutan](#19-pengembangan-lanjutan)
20. [Penutup](#20-penutup)
21. [Informasi Pengembang](#21-informasi-pengembang)

---

## 1. Judul dan Ringkasan Sistem

**PANORAMA** (Patient Queue Management and Real-time Operational Monitoring for Administration) adalah sistem manajemen antrean farmasi berbasis web yang dirancang untuk mengelola alur kerja distribusi obat di rumah sakit secara efisien. Sistem ini mengintegrasikan berbagai fungsi administratif dalam satu platform terpadu, memungkinkan monitoring real-time terhadap setiap tahap proses distribusi obat mulai dari pasien melakukan registrasi hingga pasien menerima obat.

Sistem ini dibangun menggunakan teknologi modern meliputi Next.js sebagai framework frontend dan backend, Prisma ORM untuk manajemen database, PostgreSQL sebagai basis data relasional, serta Socket.io untuk implementasi fitur real-time. Dengan arsitektur yang modular dan scalable, PANORAMA mampu mengakomodasi kebutuhan rumah sakit dengan volume pasien yang tinggi.

---

## 2. Latar Belakang Permasalahan

Pengelolaan antrean farmasi di rumah sakit seringkali menghadapi berbagai permasalahan operasional yang signifikan. Sistem antrean tradisional yang berbasis kertas atau sistem manual rentan terhadap berbagai masalah seperti kehilangan data pasien, kesalahan pencatatan, dan kurangnya transparansi terhadap status antrean. Pasien sering kali tidak mengetahui kapan tiba giliran mereka untuk menerima obat, yang menyebabkan ketidakpastian dan meningkatkan kepadatan di area farmasi.

Permasalahan lain yang sering terjadi adalah kurangnya visibilitas terhadap kinerja setiap tahap proses distribusi obat. Tanpa sistem tracking yang memadai, manajemen rumah sakit kesulitan mengidentifikasi bottleneck dalam workflow farmasi. Selain itu, koordinasi antar posisi (pos) dalam proses distribusi obat seringkali tidak terkoordinasi dengan baik, menyebabkan keterlambatan dan inefisiensi dalam pelayanan.

Kebutuhan akan layar monitoring yang dapat ditampilkan di ruang tunggu pasien juga menjadi hal yang penting untuk meningkatkan pengalaman pasien. Pasien perlu mendapatkan informasi terkini mengenai nomor antrean mereka tanpa harus terus-menerus bertanya kepada petugas. Semua permasalahan ini memerlukan solusi terintegrasi yang dapat mengatasi berbagai aspek pengelolaan antrean farmasi secara komprehensif.

---

## 3. Tujuan Pengembangan Sistem

Pengembangan sistem PANORAMA bertujuan untuk menciptakan platform pengelolaan antrean farmasi yang terintegrasi, efisien, dan transparan. Tujuan utama sistem ini meliputi optimalisasi alur kerja distribusi obat melalui pendefinisian stage yang jelas dan sequential, implementasi sistem tracking waktu yang akurat untuk setiap tahap proses, serta peningkatan transparansi informasi bagi pasien melalui layar monitoring real-time.

Sistem ini juga bertujuan untuk memfasilitasi pengawasan dan evaluasi kinerja operasional farmasi melalui penyediaan data audit yang komprehensif. Dengan demikian, manajemen dapat mengidentifikasi area yang memerlukan perbaikan dan mengambil keputusan berbasis data untuk meningkatkan kualitas layanan. Tujuan lainnya adalah penerapan prinsip keamanan data dalam pengelolaan informasi pasien dan operasional sistem.

---

## 4. Ruang Lingkup Sistem

Sistem PANORAMA dirancang untuk mengelola seluruh aspek operasional antrean farmasi rumah sakit dengan cakupan yang komprehensif. Ruang lingkup sistem mencakup modul registrasi dan entrada data pasien, manajemen workflow multi-stage dengan lima posisi operasional, implementasi sistem monitoring real-time untuk berbagai stakeholder, serta pencatatan audit log untuk keperluan evaluasi dan keamanan.

Sistem ini mendukung operasi multi-pos secara simultan dengan sinkronisasi data real-time menggunakan Socket.io. Setiap posisi memiliki akses sesuai dengan peran (role) yang diberikan, mulai dari Admin Entry yang menangani registrasi awal hingga Admin Penyerahan obat yang menangani finalisasi distribusi. Admin Utama memiliki akses penuh untuk mengawasi seluruh operasional sistem.

---

## 5. Fitur Utama

### 5.1 Multi Role Staff

Sistem PANORAMA mengimplementasikan sistem autentikasi dan otorisasi berbasis peran (role-based access control) dengan lima peran utama:

- **Admin Utama**: Memilik akses penuh untuk memonitor keseluruhan sistem, mengelola data staff, melihat laporan, dan mengakses semua fungsi administratif tanpa batasan.
- **Admin Entry**: Bertanggung jawab untuk melakukan entrada data pasien dan memindahkan antrean dari status MENUNGGU ke ENTRY.
- **Admin Transport**: Mengelola perpindahan antrean dari stage ENTRY ke TRANSPORT dan selanjutnya ke PACKAGING.
- **Admin Packaging**: Menangani proses pengemasan obat dan memindahkan antrean ke stage PENYERAHAN.
- **Admin Penyerahan Obat**: Bertugas menyelesaikan proses dengan memindahkan antrean ke status SELESAI setelah obat diberikan kepada pasien.
- **Monitoring**: Peran khusus untuk layar ruang tunggu yang bersifat read-only, hanya menampilkan informasi antrean aktif tanpa kemampuan modifikasi.

### 5.2 Workflow Antar Pos

Sistem mengimplementasikan workflow linear dengan enam stage yang berurutan:

1. **MENUNGGU**: Status awal ketika pasien telah terdaftar namun belum diproses
2. **ENTRY**: Tahap input data dan validasi resep
3. **TRANSPORT**: Tahap pengiriman obat dari gudang ke area packaging
4. **PACKAGING**: Tahap pengemasan obat sesuai resep
5. **PENYERAHAN**: Tahap persiapan obat untuk diberikan kepada pasien
6. **SELESAI**: Tahap finalisasi setelah pasien menerima obat

Setiap perpindahan stage dicatat secara otomatis dalam sistem dengan timestamp yang akurat.

### 5.3 Realtime System

Implementasi real-time pada PANORAMA menggunakan dua teknologi komplementer:

- **Socket.io**: Untuk komunikasi real-time antara client dan server, memungkinkan update status antrean tanpa perlu melakukan refresh halaman. Sinkronisasi data antar posisi terjadi secara instan.
- **Server-Sent Events (SSE)**: Sebagai backup dan alternatif untuk broadcasting data ke monitoring screen.

Sistem realtime menangani berbagai event seperti pembuatan antrean baru, perpindahan stage, pembaruan data, dan penyelesaian antrean.

### 5.4 Tracking dan Audit Log

Setiap aktivitas dalam sistem dicatat secara detail untuk keperluan tracking dan audit:

- **Pencatatan Waktu Tiap Tahap**: Sistem menyimpan timestamp untuk setiap perpindahan stage, termasuk waktu mulai dan selesai proses di setiap stage.
- **Durasi Proses**: Perhitungan otomatis durasi setiap stage dalam hitungan detik.
- **Audit Log Komprehensif**: Model `QueueAuditLog` menyimpan informasi lengkap mengenai setiap perpindahan stage, termasuk ID staff yang melakukan tindakan, stage asal, stage tujuan, dan catatan tambahan.

### 5.5 Monitoring Screen

Layar monitoring dirancang khusus untuk ditampilkan di ruang tunggu pasien:

- Tampilan fullscreen yang optimal untuk layar televisi atau monitor besar
- Mode read-only tanpa interaksi pengguna
- Menampilkan nomor antrean aktif saat ini beserta statusnya
- Daftar antrean aktif yang diurutkan berdasarkan waktu pembaruan
- Update real-time menggunakan Socket.io
- Desain visual yang menarik dengan kontras tinggi untuk keterbacaan maksimal

---

## 6. Arsitektur Sistem

### 6.1 Arsitektur Frontend

Frontend PANORAMA dibangun menggunakan Next.js dengan App Router, yang memungkinkan implementasi Server-Side Rendering (SSR) untuk performa optimal dan SEO yang baik. Komponen React digunakan secara extensif untuk membangun antarmuka pengguna yang interaktif dan responsif. State management dilakukan menggunakan React hooks (useState, useEffect, useContext) 结合 dengan API calls ke backend.

Struktur halaman diatur dalam direktori `app/` dengan pengelompokan berdasarkan功能的 (functionality-based grouping). Halaman admin terletak di `app/admin/`, halaman staff di `app/staff/`, halaman monitoring di `app/monitor/`, dan API routes di `app/api/`.

### 6.2 Arsitektur Backend

Backend PANORAMA menggunakan Next.js API Routes yang berjalan di atas Node.js runtime. Setiap endpoint API terletak di `app/api/` dan diimplementasikan menggunakan Next.js App Router conventions. Prisma ORM digunakan sebagai layer abstraksi database yang menyediakan type-safe database queries.

Autentikasi staff diimplementasikan secara custom menggunakan session-based authentication dengan password hashing menggunakan bcryptjs. Setiap request API divalidasi melalui middleware untuk memastikan hanya staff yang terotentikasi yang dapat mengakses fungsi-fungsi tertentu.

### 6.3 Arsitektur Database

Database PostgreSQL dipilih karena keandalannya dalam menangani data relasional yang kompleks. Prisma ORM mengelola schema database dan menyediakan API yang konsisten untuk operasi CRUD. Database di-host di Neon, sebuah managed PostgreSQL service yang menyediakan fitur auto-scaling dan high availability.

### 6.4 Arsitektur Realtime

Sistem real-time mengimplementasikan dual-channel broadcasting menggunakan Socket.io sebagai primary channel dan Server-Sent Events (SSE) sebagai secondary channel. Server Socket.io berjalan terpisah dari Next.js API routes namun dapat diintegrasikan dalam satu deployment. Setiap event yang relevan (queue:created, queue:moved, queue:updated, queue:completed) di-broadcast ke semua connected clients.

---

## 7. Diagram Alur Proses

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW PANORAMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │          │     │          │     │          │     │          │     │          │
    │ MENUNGGU │────▶│  ENTRY   │────▶│ TRANSPORT│────▶│PACKAGING │────▶│PENYERAHAN│
    │          │     │          │     │          │     │          │     │          │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
        │                                                                             │
        │                                                                             ▼
        │                                                                           ┌──────────┐
        │                                                                           │          │
        └───────────────────────────────────────────────────────────────────────────▶│ SELESAI  │
        │                                                                           │          │
        │                                                                           └──────────┘
        │
        │ (CANCELLED)
        ▼
    ┌──────────┐
    │          │
    │CANCELLED │
    │          │
    └──────────┘

KETERANGAN:
- MENUNGGU    : Pasien terdaftar, menunggu diproses
- ENTRY       : Input data dan validasi resep
- TRANSPORT   : Pengiriman obat ke area packaging
- PACKAGING   : Pengemasan obat
- PENYERAHAN  : Persiapan obat untuk pasien
- SELESAI     : Pasien menerima obat
- CANCELLED   : Antrean dibatalkan
```

### Alur Proses Detail

1. **Pasien Datang**: Pasien mendaftarkan nomor MRN (Medical Record Number) dan nomor antrean di sistem
2. **Stage MENUNGGU**: Antrean masuk ke sistem dengan status MENUNGGU, siap untuk diproses
3. **Stage ENTRY**: Admin Entry mengambil antrean, input data pasien, dan memindahkan ke ENTRY
4. **Stage TRANSPORT**: Admin Transport memindahkan ke TRANSPORT setelah entry selesai
5. **Stage PACKAGING**: Admin Packaging memindahkan ke PACKAGING setelah transport tiba
6. **Stage PENYERAHAN**: Admin Penyerahan obat memindahkan ke PENYERAHAN setelah packaging selesai
7. **Stage SELESAI**: Setelah pasien menerima obat, antrean ditandai sebagai SELESAI

---

## 8. Struktur Folder Project

```
panorama/
├── app/                          # Next.js App Router
│   ├── admin/                    # Halaman admin
│   │   ├── audit-logs/           # Halaman audit log
│   │   ├── dashboard/            # Dashboard admin
│   │   ├── feedback/             # Feedback pasien
│   │   ├── history/              # Riwayat antrean
│   │   ├── login/                # Halaman login admin
│   │   ├── select-role/          # Pemilihan role
│   │   └── staff/                # Manajemen staff
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API
│   │   ├── auth/                 # Autentikasi
│   │   ├── feedback/             # Feedback
│   │   ├── health/               # Health check
│   │   ├── monitor/              # Monitoring API
│   │   ├── patient/              # Patient API
│   │   ├── queue/                # Queue API
│   │   ├── realtime/             # Realtime API
│   │   └── staff/                # Staff API
│   ├── dashboard/                # Halaman dashboard
│   ├── login/                    # Halaman login pasien
│   ├── logout/                   # Logout handler
│   ├── monitor/                  # Layar monitoring
│   ├── staff/                    # Halaman staff
│   │   ├── dashboard/            # Dashboard staff
│   │   ├── login/                # Login staff
│   │   └── select-role/          # Pemilihan role staff
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Halaman utama
├── lib/                          # Utility functions dan helpers
│   ├── components/               # Reusable components
│   │   ├── LiveTimer.jsx         # Komponen timer
│   │   ├── ProgressTracker.jsx   # Progress tracker
│   │   ├── QueueCard.jsx         # Kartu antrean
│   │   └── StatusBadge.jsx       # Badge status
│   ├── auditLogUtils.js          # Utility audit log
│   ├── authUtils.js              # Utility autentikasi
│   ├── notificationUtils.js      # Utility notifikasi
│   ├── prisma.js                 # Prisma client instance
│   ├── queueLogService.js        # Service log antrean
│   ├── queueService.js           # Service antrean
│   ├── queueWorkflowService.js   # Service workflow
│   ├── realtime.js               # Realtime utilities
│   ├── roleGuard.js              # Middleware otorisasi
│   ├── sessionService.js         # Service session
│   ├── socketClient.js           # Socket.io client
│   ├── socketServer.js           # Socket.io server
│   ├── socketUtils.js            # Socket utilities
│   ├── staffAuth.js              # Staff autentikasi
│   ├── staffLabels.js           # Label staff
│   ├── status.js                 # Status definitions
│   ├── utils.js                  # General utilities
│   └── workflowConfig.js         # Konfigurasi workflow
├── prisma/                       # Prisma ORM
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Schema database
│   └── seed.js                   # Database seeder
├── __tests__/                    # Unit tests
├── public/                       # Static files
├── package.json                  # Dependencies
├── next.config.js                # Next.js configuration
├── middleware.js                 # Next.js middleware
└── vercel.json                  # Vercel configuration
```

---

## 9. Desain Database

### 9.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     Staff      │       │       Queue         │       │    Patient     │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id              │       │ id                  │       │ id              │
│ name            │       │ queue (unique)      │       │ mrn (unique)    │
│ roles[]        │◄──────│ mrn                 │───────► name            │
│ username       │       │ status              │       │ phone           │
│ passwordHash   │       │ priority            │       │ clinicOrigin    │
│ createdAt      │       │ entryAt             │       └────────┬────────┘
│                │       │ transportAt         │                │
└───────┬────────┘       │ packagingAt        │                │
        │                 │ readyAt             │                │
        │                 │ completedAt         │                │
        │                 │ duration*           │                │
        │                 │ createdAt           │                │
        │                 │ updatedAt           │                │
        │                 └─────────┬───────────┘                │
        │                           │                              │
        │                           │ 1:N                          │
        ▼                           ▼                              │
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│    Session      │       │   QueueAuditLog     │       │PatientStageNotif│
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id              │       │ id (cuid)           │       │ id (cuid)       │
│ staffId         │       │ queueId             │       │ queueId         │
│ expiresAt       │       │ staffId             │       │ patientId       │
│ revoked         │       │ action              │       │ stage           │
│ createdAt       │       │ fromStage           │       │ message         │
└─────────────────┘       │ toStage             │       │ createdAt       │
                          │ notes               │       └─────────────────┘
                          │ createdAt           │
                          └─────────────────────┘
```

### 9.2 Penjelasan Relasi Tabel

#### Tabel `Staff`
Menyimpan data petugas farmasi dengan relasi:
- One-to-Many dengan `Session` (satu staff dapat memiliki banyak sesi aktif)
- One-to-Many dengan `QueueAuditLog` (satu staff dapat melakukan banyak aksi)

#### Tabel `Queue`
Menyimpan data antrean dengan relasi:
- One-to-Many dengan `PatientStageNotification` (satu antrean dapat memiliki banyak notifikasi stage)
- One-to-Many dengan `QueueAuditLog` (satu antrean dapat memiliki banyak log audit)

#### Tabel `Patient`
Menyimpan data pasien dengan relasi:
- One-to-Many dengan `PatientStageNotification` (satu pasien dapat menerima banyak notifikasi)

#### Tabel `QueueAuditLog`
Menyimpan catatan perpindahan stage dengan relasi:
- Many-to-One dengan `Queue` (setiap log terkait dengan satu antrean)
- Many-to-One dengan `Staff` (setiap log dicatat oleh satu staff)

#### Tabel `PatientStageNotification`
Menyimpan notifikasi stage untuk pasien dengan relasi:
- Many-to-One dengan `Queue` (setiap notifikasi terkait dengan satu antrean)
- Many-to-One dengan `Patient` (setiap notifikasi untuk satu pasien)

#### Tabel `Session`
Menyimpan data sesi aktif staff dengan relasi:
- Many-to-One dengan `Staff` (setiap sesi milik satu staff)

### 9.3 Enum Definitions

```
prisma
enum QueueStatus {
  MENUNGGU    // Menunggu untuk diproses
  ENTRY       // Tahap input data
  TRANSPORT   // Tahap pengantaran
  PACKAGING   // Tahap pengemasan
  PENYERAHAN  // Tahap penyerahan
  SELESAI     // Selesai
  CANCELLED   // Dibatalkan
}

enum AdminRole {
  UTAMA       // Super admin - akses penuh
  ENTRY       // Admin Entry
  TRANSPORT   // Admin Transport
  PACKAGING   // Admin Packaging
  PENYERAHAN  // Admin Penyerahan
}
```

---

## 10. Role dan Hak Akses

### 10.1 Matriks Role dan Permissions

| Role | Dashboard | Entry | Transport | Packaging | Penyerahan | Audit Logs | Staff Mgmt | Monitoring |
|------|-----------|-------|-----------|-----------|------------|------------|------------|------------|
| **Admin Utama** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Admin Entry** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Admin Transport** | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Admin Packaging** | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| **Admin Penyerahan** | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **Monitoring** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### 10.2 Detail Setiap Role

| Role | Kode | Deskripsi | Workflow Actions |
|------|------|-----------|------------------|
| Admin Utama | UTAMA | Super administrator dengan akses penuh ke semua fungsi sistem | Dapat melakukan perpindahan stage ke semua arah |
| Admin Entry | ENTRY | Petugas yang menangani input data pasien dan validasi resep | MENUNGGU → ENTRY → TRANSPORT |
| Admin Transport | TRANSPORT | Petugas yang menangani pengantaran obat ke area packaging | ENTRY → TRANSPORT → PACKAGING |
| Admin Packaging | PACKAGING | Petugas yang menangani pengemasan obat | TRANSPORT → PACKAGING → PENYERAHAN |
| Admin Penyerahan | PENYERAHAN | Petugas yang menangani penyerahan obat kepada pasien | PENYERAHAN → SELESAI |
| Monitoring | MONITORING | Peran khusus untuk layar display | Read-only, hanya melihat data |

---

## 11. Mekanisme Realtime

### 11.1 Arsitektur Realtime

PANORAMA mengimplementasikan sistem real-time menggunakan dua teknologi yang bekerja secara komplementer:

1. **Socket.io (Primary)**: Digunakan untuk komunikasi bidirectional antara server dan client. Memungkinkan event-driven updates dengan latensi rendah.

2. **Server-Sent Events (SSE) (Backup)**: Digunakan sebagai alternatif untuk browser yang tidak mendukung WebSocket secara optimal dan untuk monitoring screen.

### 11.2 Event Types

```
javascript
// Event yang di-broadcast ke semua clients
QUEUE_CREATED    = "queue:created"    // Antrean baru dibuat
QUEUE_UPDATED    = "queue:updated"    // Data antrean diperbarui
QUEUE_MOVED      = "queue:moved"      // Antrean berpindah stage
QUEUE_COMPLETED  = "queue:completed"  // Antrean selesai
QUEUE_POLLLED    = "queue:polled"    // Polling fallback
```

### 11.3 Implementasi Client-side

```
javascript
// Contoh koneksi Socket.io di client
import { getSocketClient } from "@/lib/socketClient";

const client = getSocketClient();
client.connect("MONITORING");

// Listen untuk update antrean
client.on("queue:moved", (updated) => {
  // Update UI dengan data terbaru
});
```

### 11.4 Implementasi Server-side

```
javascript
// Broadcasting event (di lib/socketUtils.js)
import { emitQueueCreated, emitQueueMovedStage } from "@/lib/socketUtils";

// Setelah perpindahan stage
await emitQueueMovedStage(queue, previousStatus);
```

---

## 12. Monitoring Screen

### 12.1 Fitur Monitoring Screen

Layar monitoring PANORAMA dirancang khusus untuk ditampilkan di ruang tunggu pasien dengan fitur-fitur berikut:

- **Tampilan Fullscreen**: Dirancang optimal untuk layar televisi atau monitor besar dengan resolusi tinggi
- **Mode Read-Only**: Tidak ada interaksi pengguna, hanya menampilkan informasi
- **Update Real-Time**: Menggunakan Socket.io untuk update otomatis tanpa refresh
- **Highlight Perubahan**: Antrean yang baru berpindah stage ditandai dengan efek visual
- **Auto-Scroll**: Daftar antrean bergerak otomatis jika terlalu panjang
- **Jam Digital**: Menampilkan waktu saat ini secara real-time

### 12.2 Struktur Tampilan

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYAR MONITORING ANTRIAN                         │
│                              14:32:45                               │
├─────────────────────────────────────────────────────────────────────┤
│  NOMOR ANTRIAN SAAT INI                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                           A001                                │ │
│  │                    Pasien: John Doe                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ ┌───────────────────────────┐ │
│  │  STATUS                         │ │                           │ │
│  │  Packaging                     │ │   Sedang diproses         │ │
│  └──────────────────────────────────┘ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  DAFTAR ANTRIAN AKTIF (5)                                          │
│  ┌──────────┬─────────────┬─────────────┬────────────────────────┐ │
│  │ No.      │ Nama        │ Status      │ Keterangan             │ │
│  ├──────────┼─────────────┼─────────────┼────────────────────────┤ │
│  │ A002     │ Jane Smith  │ Transport   │ Sedang diproses        │ │
│  │ A003     │ Bob Wilson  │ Entry       │ Sedang diproses        │ │
│  │ A004     │ Alice Brown │ Menunggu    │ Sedang diproses        │ │
│  └──────────┴─────────────┴─────────────┴────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 12.3 Akses Monitoring Screen

Monitoring screen dapat diakses melalui URL `/monitor` dan tidak memerlukan autentikasi karena bersifat publik untuk ditampilkan di ruang tunggu.

---

## 13. Tracking Waktu dan Audit Log

### 13.1 Tracking Waktu Tiap Stage

Sistem secara otomatis mencatat waktu pada setiap tahap proses:

```
javascript
// Timestamp yang disimpan di database
{
  // Waktu masuk ke setiap stage
  entryAt: DateTime,
  transportAt: DateTime,
  packagingAt: DateTime,
  readyAt: DateTime,
  completedAt: DateTime,

  // Waktu mulai proses di setiap stage
  entryStartAt: DateTime,
  transportStartAt: DateTime,
  packagingStartAt: DateTime,
  penyerahanStartAt: DateTime,

  // Waktu selesai proses di setiap stage
  entryEndAt: DateTime,
  transportEndAt: DateTime,
  packagingEndAt: DateTime,
  penyerahanEndAt: DateTime,

  // Durasi dalam detik
  durationEntry: Int,
  durationTransport: Int,
  durationPackaging: Int,
  durationPenyerahan: Int,
  durationTotal: Int
}
```

### 13.2 Audit Log

Setiap tindakan yang dilakukan staff dicatat dalam `QueueAuditLog`:

```
javascript
// Struktur QueueAuditLog
{
  id: String (cuid),
  queueId: Int,
  staffId: Int?,
  action: String,           // Jenis tindakan
  fromStage: QueueStatus?, // Stage sebelumnya
  toStage: QueueStatus?,   // Stage tujuan
  notes: String?,          // Catatan tambahan
  createdAt: DateTime
}
```

### 13.3 Contoh Penggunaan

- Perpindahan stage: `action: "STAGE_TRANSITION"`, `fromStage: "ENTRY"`, `toStage: "TRANSPORT"`
- Priority change: `action: "PRIORITY_CHANGE"`, `notes: "Urgent patient"`
- Cancellation: `action: "CANCEL"`, `toStage: "CANCELLED"`

---

## 14. Instalasi dan Setup Lokal

### 14.1 Prerequisites

Pastikan sistem Anda telah terinstal dengan:

- Node.js (versi 18.x atau lebih tinggi)
- npm atau yarn
- PostgreSQL (lokal atau menggunakan Neon)

### 14.2 Steps Instalasi

#### Langkah 1: Clone Repository

```
bash
git clone <repository-url>
cd panorama
```

#### Langkah 2: Install Dependencies

```
bash
npm install
```

#### Langkah 3: Setup Environment Variables

Buat file `.env` di root directory dengan isi sebagai berikut:

```
env
# Database connection string (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Session configuration (optional)
SESSION_MAX_AGE_SECONDS=43200
```

#### Langkah 4: Generate Prisma Client

```
bash
npx prisma generate
```

#### Langkah 5: Setup Database

```
bash
# Push schema ke database
npx prisma db push

# Atau menggunakan migrate
npx prisma migrate dev
```

#### Langkah 6: Seed Database (Optional)

```bash
npx prisma db seed
```

#### Langkah 7: Jalankan Development Server

```
bash
npm run dev
```

Buka browser dan akses `http://localhost:3000`.

### 14.3 Verifikasi Instalasi

Setelah instalasi berhasil, Anda dapat memverifikasi dengan:

- Health check endpoint: `http://localhost:3000/api/health`
- Halaman monitoring: `http://localhost:3000/monitor`
- Halaman login staff: `http://localhost:3000/staff/login`

---

## 15. Environment Variables

### 15.1 Daftar Environment Variables

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `DATABASE_URL` | Ya | - | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Tidak | `http://localhost:3000` | URL aplikasi untuk origin checks |
| `SESSION_MAX_AGE_SECONDS` | Tidak | `43200` | Session timeout dalam detik (12 jam) |
| `RATE_LIMIT_WINDOW_MS` | Tidak | `60000` | Rate limit window dalam milidetik |
| `RATE_LIMIT_MAX_REQUESTS` | Tidak | `100` | Maksimal request per window |

### 15.2 Format DATABASE_URL

```
env
# Format Neon
DATABASE_URL="postgresql://username:password@ep-something.us-east-1.aws.neon.tech/panorama?sslmode=require"

# Format lokal
DATABASE_URL="postgresql://postgres:password@localhost:5432/panorama"
```

---

## 16. Proses Migrasi Database

### 16.1 Menggunakan Prisma Migrate

Prisma Migrate digunakan untuk mengelola schema database:

```
bash
# Membuat migrasi baru
npx prisma migrate dev --name init

# Apply migrasi ke database production
npx prisma migrate deploy

# Melihat status migrasi
npx prisma migrate status
```

### 16.2 Menggunakan Prisma DB Push

Untuk development cepat:

```
bash
# Push schema ke database (tanpa migrasi)
npx prisma db push
```

### 16.3 Reset Database

```
bash
# Reset database dan apply semua migrasi
npx prisma migrate reset
```

### 16.4 Generate Prisma Client

Setelah migrasi atau perubahan schema:

```
bash
npx prisma generate
```

---

## 17. Cara Deployment ke Vercel

### 17.1 Prerequisites

- Akun Vercel
- Repository Git (GitHub, GitLab, atau Bitbucket)
- Database PostgreSQL (Neon atau provider lain)

### 17.2 Langkah Deployment

#### Langkah 1: Persiapan Repository

Pastikan repository bersih dari node_modules:

```
bash
# Tambahkan ke .gitignore jika belum ada
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
```

#### Langkah 2: Push ke Git

```
bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### Langkah 3: Import ke Vercel

1. Buka dashboard Vercel di https://vercel.com
2. Klik "Add New..." → "Project"
3. Import repository Anda
4. Configure project dengan settings berikut:
   - Framework Preset: Next.js
   - Build Command: `prisma generate && next build` (atau biarkan kosong)
   - Output Directory: `.next` (atau biarkan kosong)

#### Langkah 4: Configure Environment Variables

Di halaman project settings, tambahkan variabel environment:

```
DATABASE_URL = postgresql://...
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

#### Langkah 5: Deploy

Klik "Deploy" dan tunggu hingga proses selesai.

### 17.3 Verifikasi Deployment

Setelah deployment berhasil:

- Buka `https://your-app.vercel.app`
- Cek health check: `https://your-app.vercel.app/api/health`
- Buka monitoring: `https://your-app.vercel.app/monitor`

---

## 18. Strategi Keamanan dan Validasi

### 18.1 Keamanan Autentikasi

- **Password Hashing**: Menggunakan bcryptjs untuk hashing password dengan salt yang aman
- **Session Management**: Session-based authentication dengan expiry time yang dapat dikonfigurasi
- **CSRF Protection**: Implementasi CSRF tokens untuk semua form submission

### 18.2 Keamanan API

- **Role-based Access Control**: Setiap endpoint API divalidasi menggunakan middleware `requireRole`
- **Input Validation**: Menggunakan Zod untuk validasi input data
- **Rate Limiting**: Konfigurasi rate limiting untuk mencegah abuse

### 18.3 Keamanan Database

- **Parameterized Queries**: Prisma ORM menggunakan parameterized queries secara otomatis
- **Least Privilege**: Akun database dengan permission yang minimal diperlukan
- **SSL/TLS**: Koneksi database menggunakan SSL untuk production

### 18.4 Keamanan Frontend

- **XSS Prevention**: React secara otomatis melakukan escaping
- **Content Security Policy**: Header CSP dikonfigurasi di middleware
- **No Sensitive Data in URL**: Data sensitif tidak pernah di-expose di URL

---

## 19. Pengembangan Lanjutan

### 19.1 Fitur yang Dapat Ditambahkan

1. **SMS Notification**: Integrasi dengan provider SMS untuk notifikasi ke pasien
2. **WhatsApp Integration**: Notifikasi melalui WhatsApp API
3. **Queue Prediction**: Prediksi waktu tunggu berbasis machine learning
4. **Mobile App**: Aplikasi mobile untuk pasien
5. **Multi-branch Support**: Dukungan untuk rumah sakit dengan banyak cabang
6. **Reporting Module**: Laporan statistik yang lebih komprehensif
7. **Appointment System**: Sistem janji temu untuk mengurangi antrean
8. **Prescription OCR**: Input resep otomatis menggunakan OCR

### 19.2 Optimisasi yang Dapat Dilakukan

1. **Caching**: Implementasi Redis untuk caching data yang sering diakses
2. **Database Indexing**: Penambahan index untuk query yang lambat
3. **CDN**: Penggunaan CDN untuk static assets
4. **Image Optimization**: Optimasi gambar menggunakan Next.js Image

---

## 20. Penutup

Sistem PANORAMA merupakan solusi komprehensif untuk manajemen antrean farmasi rumah sakit yang mengintegrasikan teknologi modern dengan kebutuhan operasional yang riil. Dengan arsitektur yang modular, scalable, dan mudah dipahami, sistem ini dapat diadaptasi sesuai dengan kebutuhan spesifik institusi kesehatan.

Dokumentasi ini mencakup seluruh aspek teknis yang diperlukan untuk pengembangan, deployment, dan pemeliharaan sistem. Dengan mengikuti panduan yang telah disediakan, pengembang dan administrator sistem dapat mengoperasikan PANORAMA dengan efektif dan efisien.

---

## 21. Informasi Pengembang

### Teknologi yang Digunakan

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js | 14.2.5 |
| Database | PostgreSQL | - |
| ORM | Prisma | 5.0.0 |
| Real-time | Socket.io | 4.8.3 |
| Deployment | Vercel | - |

### Lisensi

Proyek ini dilisensikan di bawah lisensi MIT.

### Kontribusi

Untuk berkontribusi pada proyek ini, silakan membuat pull request atau membuka issue di repository.

---

**Last Updated**: December 2025

**Versi**: 1.0.0
