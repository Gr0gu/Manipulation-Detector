import { NextResponse } from "next/server";
import { loadSessionFiles, buildSessionOverview, isSafeSessionId } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  const id = (await context.params).id;
  try {
    if (!isSafeSessionId(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }
    const { strict, full, high } = await loadSessionFiles(id);
    const overview = buildSessionOverview(full, strict);
    return NextResponse.json({
      id,
      strict,
      full,
      high,
      overview,
    });
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to load session" },
      { status },
    );
  }
}
