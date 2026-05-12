import { NextResponse } from "next/server";
import { getAggregate } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAggregate();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to aggregate" },
      { status: 500 },
    );
  }
}
