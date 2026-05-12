import { NextResponse } from "next/server";
import { listSessions } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json({ sessions });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to list sessions" },
      { status: 500 },
    );
  }
}
