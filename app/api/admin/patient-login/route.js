import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const patientsFilePath = path.join(process.cwd(), "data", "patients.json");

// For Vercel compatibility - use multiple fallback strategies
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

export async function GET() {
  try {
    const patients = readPatientsData();
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nomorAntrean, nomorRekamMedis } = body;

    // Validate required fields
    if (!nomorAntrean || !nomorRekamMedis) {
      return NextResponse.json(
        { error: "Nomor antrean dan MRN wajib diisi" },
        { status: 400 }
      );
    }

    // Check for duplicate queue number
    const patients = readPatientsData();
    const existingPatient = patients.find(p => p.nomorAntrean === nomorAntrean);
    if (existingPatient) {
      return NextResponse.json(
        { error: "Nomor antrean sudah digunakan" },
        { status: 400 }
      );
    }

    // Create new patient record
    const newPatient = {
      id: patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1,
      nomorAntrean,
      nomorRekamMedis: nomorRekamMedis.toUpperCase(),
      waktuLogin: new Date().toISOString(),
      statusAntrean: "Waiting"
    };

    patients.push(newPatient);
    writePatientsData(patients);

    console.log("Pasien baru ditambahkan:", newPatient);

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear all patient data
    writePatientsData([]);
    console.log("Semua data pasien telah dihapus");
    return NextResponse.json({ message: "All patients deleted successfully" });
  } catch (error) {
    console.error("Error deleting patients:", error);
    return NextResponse.json({ error: "Failed to delete patients" }, { status: 500 });
  }
}
