import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQueueByPatient } from "@/lib/queueService";

// Verify admin authentication
async function verifyAuth(request) {
  const auth = request.cookies.get("auth");
  return auth?.value === "admin";
}

// Map Prisma PatientLogin record to the shape expected by frontend
function mapPatientLoginRecord(record) {
  return {
    id: record.id,
    nomorAntrean: record.queue,
    nomorRekamMedis: record.mrn,
    waktuLogin: record.loginTime,
    statusAntrean: record.status || "Waiting",
  };
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mrn = searchParams.get("mrn") || undefined;

    const logins = await prisma.patientLogin.findMany({
      where: mrn ? { mrn } : undefined,
      orderBy: { loginTime: "desc" },
    });

    const result = logins.map(mapPatientLoginRecord);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { queue, mrn } = body;

    // Validate required fields
    if (!queue || !mrn) {
      return NextResponse.json(
        { error: "Queue and MRN are required" },
        { status: 400 }
      );
    }

    // Validate MRN format (numbers only, max 8 chars)
    if (!/^[0-9]+$/.test(mrn) || mrn.length > 8) {
      return NextResponse.json(
        { error: "MRN must be numeric and max 8 characters" },
        { status: 400 }
      );
    }

    // Check for duplicate queue number for this MRN
    const existing = await prisma.patientLogin.findFirst({
      where: { queue, mrn },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Queue number already exists for this MRN" },
        { status: 409 }
      );
    }

    // Optional but ideal: cek apakah antrean dengan kombinasi queue+mrn sudah ada di tabel Queue
    try {
      const matchedQueue = await getQueueByPatient(queue, mrn);
      if (!matchedQueue) {
        console.warn(
          "No matching Queue found for PatientLogin. Creating login with default status 'Waiting'."
        );
      }
    } catch (lookupError) {
      console.error("Failed to validate Queue for PatientLogin (continuing):", lookupError);
    }

    const created = await prisma.patientLogin.create({
      data: {
        queue,
        mrn,
        status: "Waiting",
      },
    });

    console.log("Pasien baru ditambahkan (Prisma):", created);

    return NextResponse.json(mapPatientLoginRecord(created), { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.patientLogin.deleteMany();
    console.log("Semua data pasien telah dihapus dari Prisma");
    return NextResponse.json({ message: "All patients deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting patients:", error);
    return NextResponse.json({ error: "Failed to delete patients" }, { status: 500 });
  }
}
