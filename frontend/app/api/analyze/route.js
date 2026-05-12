import { NextResponse } from "next/server";
import path from "path";
import { getManipConfig } from "@/lib/paths";
import { sanitizePdfStem } from "@/lib/data";
import { runPipeline, writeUploadBuffer, fileExists } from "@/lib/pipeline";
import fs from "fs/promises";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function POST(request) {
  const { root, exe, resultsDir } = getManipConfig();

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF uploads are allowed" }, { status: 400 });
    }
    const originalName = file.name || "upload.pdf";
    if (!originalName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a .pdf" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_UPLOAD_BYTES} bytes)` },
        { status: 400 },
      );
    }

    if (!(await fileExists(exe))) {
      return NextResponse.json(
        {
          error:
            "Detector executable not found. Set MANIP_DETECTOR_EXE or build the backend.",
        },
        { status: 503 },
      );
    }

    const stem = sanitizePdfStem(originalName);
    const uploadsDir = path.join(resultsDir, "_uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const pdfPath = path.join(uploadsDir, `${stem}.pdf`);
    await writeUploadBuffer(pdfPath, buf);

    const resultsAbs = path.resolve(resultsDir);
    const pdfAbs = path.resolve(pdfPath);

    await runPipeline(exe, pdfAbs, resultsAbs, root);

    const strictPath = path.join(resultsDir, `${stem}_strict90_analysis.json`);
    const raw = await fs.readFile(strictPath, "utf8");
    const strict = JSON.parse(raw);

    return NextResponse.json({
      sessionId: stem,
      strict,
    });
  } catch (e) {
    console.error(e);
    const message =
      e.stderr?.slice?.(-4000) || e.message || "Pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
