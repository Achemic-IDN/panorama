import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

// Patient data storage configuration
const patientsFilePath = path.join(process.cwd(), "data", "patients.json");
const isVercel = process.env.VERCEL === '1';
const vercelPatientsFilePath = path.join('/tmp', 'patients.json');
const finalPatientsFilePath = isVercel ? vercelPatientsFilePath : patientsFilePath;

// In-memory storage as fallback for Vercel (persists during function execution)
let inMemoryPatients = [];

// Helper function to read patients data with multiple fallbacks
function readPatientsData() {
  // Try file storage first
  try {
    const data = fs.readFileSync(finalPatientsFilePath, "utf8");
    const parsedData = JSON.parse(data);
    // Sync in-memory storage with file data
    inMemoryPatients = parsedData;
    return parsedData;
  } catch (fileError) {
    console.log("File storage not available, using in-memory storage");
    // Fallback to in-memory storage
    return inMemoryPatients;
  }
}

// Helper function to write patients data with multiple strategies
function writePatientsData(data) {
  // Update in-memory storage first (always works)
  inMemoryPatients = data;

  // Try to write to file as backup
  try {
    fs.writeFileSync(finalPatientsFilePath, JSON.stringify(data, null, 2));
    console.log("Data saved to file storage");
  } catch (fileError) {
    console.log("File storage failed, data stored in memory only");
    // Data is still stored in memory, which works for the current session
  }
}

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
