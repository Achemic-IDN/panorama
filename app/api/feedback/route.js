import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

const filePath = path.join(process.cwd(), "data", "feedback.json");

// pastikan folder & file ada
function ensureFile() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
}

// =====================
// POST → SIMPAN FEEDBACK
// =====================
export async function POST(req) {
  ensureFile();

  const cookie = cookies().get("auth");
  if (!cookie) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const feedback = {
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
    time: new Date().toISOString(),
  };

  const data = JSON.parse(fs.readFileSync(filePath));
  data.push(feedback);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return NextResponse.json({ success: true });
}

// =====================
// GET → AMBIL SEMUA FEEDBACK (ADMIN)
// =====================
export async function GET() {
  ensureFile();

  const cookie = cookies().get("auth");
  if (!cookie || cookie.value !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = JSON.parse(fs.readFileSync(filePath));
  return NextResponse.json(data.reverse());
}
