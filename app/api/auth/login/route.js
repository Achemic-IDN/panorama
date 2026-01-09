import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json();
  const { username, password, role, queue, mrn } = body;

  // Admin login
  if (role === "admin" && username === "admin" && password === "panorama") {
    const res = NextResponse.json({ success: true });

    res.cookies.set("auth", "admin", {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: "/",
    });

    return res;
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

    // Allow any queue number, no validation needed
    if (!queue) {
      return NextResponse.json(
        { success: false, message: "Nomor antrean wajib diisi" },
        { status: 400 }
      );
    }

    try {
      // Check for duplicate queue number
      const patients = readPatientsData();
      const existingPatient = patients.find(p => p.nomorAntrean === queue);
      if (existingPatient) {
        return NextResponse.json(
          { success: false, message: "Nomor antrean sudah digunakan" },
          { status: 400 }
        );
      }

      // Create new patient record
      const newPatient = {
        id: patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1,
        nomorAntrean: queue,
        nomorRekamMedis: mrn.toUpperCase(),
        waktuLogin: new Date().toISOString(),
        statusAntrean: "Waiting"
      };

      patients.push(newPatient);
      writePatientsData(patients);

      console.log("Pasien login tersimpan:", newPatient);

      const res = NextResponse.json({
        success: true,
        patientData: newPatient
      });

      res.cookies.set("auth", "patient", {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: "/",
      });

      // Store patient data in cookie for dashboard display
      res.cookies.set("patientData", JSON.stringify(newPatient), {
        httpOnly: false, // Allow client-side access
        secure: true,
        sameSite: 'lax',
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return res;
    } catch (error) {
      console.error("Error saving patient login:", error);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan data login" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Login gagal" },
    { status: 401 }
  );
}
