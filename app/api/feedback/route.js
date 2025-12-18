import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const feedbackFile = path.join(process.cwd(), "feedback.json");

function loadFeedbacks() {
  try {
    const data = fs.readFileSync(feedbackFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveFeedbacks(feedbacks) {
  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));
  } catch (error) {
    console.error("Error saving feedbacks:", error);
  }
}

export async function POST(req) {
  const body = await req.json();

  if (!body.queue || !body.mrn || !body.message) {
    return new NextResponse("Invalid data", { status: 400 });
  }

  const feedbacks = loadFeedbacks();
  const feedback = {
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
    rating: body.rating || 5,
    time: new Date().toISOString(),
  };

  feedbacks.push(feedback);
  saveFeedbacks(feedbacks);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const feedbacks = loadFeedbacks();
  return NextResponse.json({
    feedbacks,
  });
}
