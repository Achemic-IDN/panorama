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
      // Save patient data to JSON file via API call
      const patientData = {
        nomorAntrean: queue,
        nomorRekamMedis: mrn.toUpperCase()
      };

      const apiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/admin/patient-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        return NextResponse.json(
          { success: false, message: errorData.error || "Gagal menyimpan data pasien" },
          { status: 500 }
        );
      }

      const savedPatient = await apiResponse.json();
      console.log("Pasien login tersimpan:", savedPatient);

      const res = NextResponse.json({
        success: true,
        patientData: savedPatient
      });

      res.cookies.set("auth", "patient", {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: "/",
      });

      // Store patient data in cookie for dashboard display
      res.cookies.set("patientData", JSON.stringify(savedPatient), {
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
