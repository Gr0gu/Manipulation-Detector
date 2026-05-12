import { NextResponse } from "next/server";
import { searchAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    const data = await searchAll(q);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Search failed" },
      { status: 500 },
    );
  }
}
