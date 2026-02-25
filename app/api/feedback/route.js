import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// file-based storage for feedback as a fallback
const feedbackFilePath = path.join(process.cwd(), "data", "feedback.json");
let inMemoryFeedback = [];

function readFeedbackData() {
  try {
    const data = fs.readFileSync(feedbackFilePath, "utf8");
    // use safe parser to handle stray unicode escapes
    const { safeJsonParse } = require("@/lib/jsonUtils");
    const parsed = safeJsonParse(data) || [];
    inMemoryFeedback = parsed;
    return parsed;
  } catch (err) {
    console.log("Feedback file not available, using in-memory list");
    return inMemoryFeedback;
  }
}

function writeFeedbackData(list) {
  inMemoryFeedback = list;
  try {
    fs.writeFileSync(feedbackFilePath, JSON.stringify(list, null, 2));
    console.log("Feedback saved to file storage");
  } catch (err) {
    console.log("Failed to write feedback file, keeping in-memory only");
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.queue || !body.mrn || !body.message) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // always write to file list first
    const existing = readFeedbackData();
    const newFeedback = {
      id: existing.length > 0 ? Math.max(...existing.map(f => f.id)) + 1 : 1,
      queue: body.queue,
      mrn: body.mrn,
      message: body.message,
      rating: body.rating || 5,
      time: new Date().toISOString(),
    };
    existing.push(newFeedback);
    writeFeedbackData(existing);

    // attempt to write to DB but don't fail on error
    try {
      await prisma.feedback.create({
        data: newFeedback,
      });
    } catch (dbErr) {
      console.error("Database error creating feedback (continuing):", dbErr);
    }

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // try database first
    try {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { time: 'desc' },
      });
      return NextResponse.json({ feedbacks });
    } catch (dbErr) {
      console.error("Database fetch failed, falling back to file:", dbErr);
    }

    // fallback to file or in-memory
    const feedbacks = readFeedbackData();
    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ feedbacks: [] }, { status: 200 });
  }
}
