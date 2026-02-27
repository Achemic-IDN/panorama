import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCsrfToken } from "@/lib/csrf";
import { createSession } from "@/lib/sessionService";
import { logQueueCreated } from "@/lib/queueLogService";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json();
  const { username, password, role, queue, mrn } = body;

  const isProd = process.env.NODE_ENV === "production";

  // Admin login (now dynamic using staff table)
  if (role === "admin") {
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password wajib diisi" }, { status: 400 });
    }

    // Short-circuit for default admin account so it tetap bisa login
    // meskipun database (tabel staff) belum dikonfigurasi dengan benar.
    if (username === "admin" && password === "panorama") {
      const maxAge = parseInt(process.env.SESSION_MAX_AGE_SECONDS || "43200", 10);
      const res = NextResponse.json({ success: true, data: { roles: ["UTAMA"] } });

      res.cookies.set("auth", "admin", {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: "/",
        maxAge,
      });

      try {
        const fallback = await prisma.staff.findFirst({ where: { username: "admin" } });
        if (fallback) {
          res.cookies.set("staff_id", String(fallback.id), {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: "/",
            maxAge,
          });
          res.cookies.set("staff_role", "UTAMA", {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: "/",
            maxAge,
          });
          try {
            const sess = await createSession(fallback.id, maxAge);
            res.cookies.set("session_id", sess.id, {
              httpOnly: true,
              secure: isProd,
              sameSite: 'lax',
              path: "/",
              maxAge,
            });
          } catch (e) {
            console.error("Failed to create fallback session:", e);
          }
        }
      } catch {}

      res.cookies.set("session_birthdate", new Date().toISOString(), {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: "/",
        maxAge,
      });

      const csrfToken = createCsrfToken();
      res.cookies.set("csrf_token", csrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: "/",
        maxAge,
      });

      return res;
    }

    try {
      // try database lookup first
      const staff = await prisma.staff.findUnique({ where: { username } });
      if (staff) {
        const bcrypt = require("bcryptjs");
        const ok = await bcrypt.compare(password, staff.passwordHash);
        if (!ok) {
          // allow legacy hardcoded admin pw for compatibility
          if (!(username === "admin" && password === "panorama")) {
            return NextResponse.json({ success: false, message: "Username atau password salah" }, { status: 401 });
          }
        }

        const maxAge = parseInt(process.env.SESSION_MAX_AGE_SECONDS || "43200", 10);
        const res = NextResponse.json({ success: true, data: { roles: staff.roles } });
        res.cookies.set("auth", "admin", {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: "/",
          maxAge,
        });
        res.cookies.set("staff_id", String(staff.id), {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: "/",
          maxAge,
        });
        if (Array.isArray(staff.roles) && staff.roles.length === 1) {
          res.cookies.set("staff_role", staff.roles[0], {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: "/",
            maxAge,
          });
        }
        res.cookies.set("session_birthdate", new Date().toISOString(), {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: "/",
          maxAge,
        });
        // create DB session record
        try {
          const sess = await createSession(staff.id, maxAge);
          res.cookies.set("session_id", sess.id, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: "/",
            maxAge,
          });
        } catch (e) {
          console.error("Failed to create session record:", e);
        }
        // csrf cookie
        const csrfToken = createCsrfToken();
        res.cookies.set("csrf_token", csrfToken, {
          httpOnly: false,
          secure: isProd,
          sameSite: 'lax',
          path: "/",
          maxAge,
        });
        return res;
      }

      return NextResponse.json({ success: false, message: "Username atau password salah" }, { status: 401 });
    } catch (err) {
      console.error("Admin login error:", err);
      return NextResponse.json({ success: false, message: "Gagal login admin" }, { status: 500 });
    }
  }

  // Patient login validation
  if (role === "patient") {
    // Validate MRN: only numbers, up to 8 characters, required
    if (!mrn) {
      return NextResponse.json(
        { success: false, message: "Nomor Rekam Medis wajib diisi" },
        { status: 400 }
      );
    }

    if (mrn.length > 8) {
      return NextResponse.json(
        { success: false, message: "Nomor Rekam Medis maksimal 8 karakter" },
        { status: 400 }
      );
    }

    if (!/^[0-9]+$/.test(mrn)) {
      return NextResponse.json(
        { success: false, message: "Nomor Rekam Medis hanya boleh berisi angka" },
        { status: 400 }
      );
    }

    // Queue must be provided and only contain digits
    if (!queue) {
      return NextResponse.json(
        { success: false, message: "Nomor antrean wajib diisi" },
        { status: 400 }
      );
    }

    if (!/^[0-9]+$/.test(queue)) {
      return NextResponse.json(
        { success: false, message: "Nomor antrean hanya boleh berisi angka" },
        { status: 400 }
      );
    }

    try {
      // Normalize MRN
      const normalizedMrn = mrn.toUpperCase();

      // Prevent duplicate queue number being used by multiple logins
      try {
        const existingLogin = await prisma.patientLogin.findFirst({
          where: { queue, mrn: normalizedMrn },
        });
        if (existingLogin) {
          return NextResponse.json(
            { success: false, message: "Login untuk nomor antrean dan MRN ini sudah tercatat" },
            { status: 400 }
          );
        }
      } catch (dbError) {
        console.error("Database check for existing patient login failed (continuing):", dbError);
      }

      // Also check for duplicate queue number in database queues (ignore on failure)
      try {
        const existingQueue = await prisma.queue.findUnique({
          where: { queue },
        });
        if (existingQueue) {
          return NextResponse.json(
            { success: false, message: "Nomor antrean sudah digunakan" },
            { status: 400 }
          );
        }
      } catch (dbError) {
        console.error("Database check for existing queue failed (continuing):", dbError);
        // allow login to proceed even if database isn't available
      }

      // Create a persistent record in Prisma for this patient login
      let patientLoginRecord;
      try {
        patientLoginRecord = await prisma.patientLogin.create({
          data: {
            queue,
            mrn: normalizedMrn,
            status: "WAITING",
          },
        });
      } catch (dbError) {
        console.error("Database error creating patient login record:", dbError);
        return NextResponse.json(
          { success: false, message: "Gagal menyimpan riwayat login pasien" },
          { status: 500 }
        );
      }

      // Also create a queue entry in the database for admin dashboard (best-effort)
      let newQueue = null;
      try {
        newQueue = await prisma.queue.create({
          data: {
            queue,
            mrn: normalizedMrn,
          },
        });
        console.log("Antrean dibuat:", newQueue);
      } catch (dbError) {
        // log database failures but don't block patient from logging in
        console.error("Database error creating queue entry (continuing):", dbError);
      }

      // Log queue creation for this patient in QueueLog
      try {
        await logQueueCreated({
          queueNumber: queue,
          medicalRecordNumber: normalizedMrn,
        });
      } catch (logError) {
        console.error("Failed to log patient queue creation:", logError);
      }

      // Shape data as expected by existing frontend (dashboard & cookies)
      const newPatient = {
        id: patientLoginRecord.id,
        nomorAntrean: patientLoginRecord.queue,
        nomorRekamMedis: patientLoginRecord.mrn,
        waktuLogin: patientLoginRecord.loginTime.toISOString(),
        statusAntrean: patientLoginRecord.status || "WAITING",
      };

      console.log("Pasien login tersimpan (Prisma):", newPatient);

      const res = NextResponse.json({
        success: true,
        patientData: newPatient,
      });

      res.cookies.set("auth", "patient", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
      });

      // Store patient data in cookie for dashboard display
      res.cookies.set("patientData", JSON.stringify(newPatient), {
        httpOnly: false, // Allow client-side access
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return res;
    } catch (error) {
      console.error("Error saving patient login:", error);
      // provide more specific message when possible
      if (error?.code === "P2002") {
        // unique constraint violation
        return NextResponse.json(
          { success: false, message: "Nomor antrean sudah digunakan (duplikat)" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Gagal menyimpan data login: " + (error.message || error) },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Login gagal" },
    { status: 401 }
  );
}
