import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function verifyAuth(request) {
  const auth = request.cookies.get("auth");
  return auth?.value === "admin";
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = (body?.name || "").trim();
    const username = (body?.username || "").trim();
    const password = body?.password || "";
    const role = body?.role;

    const allowedRoles = ["ENTRY", "TRANSPORT", "PACKAGING", "PICKUP", "ADMIN"];

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { error: "Name, username, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.staff.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.create({
      data: {
        name,
        username,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}

