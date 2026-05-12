import fs from "fs/promises";
import path from "path";
import { getManipConfig } from "@/lib/paths";

const STRICT_SUFFIX = "_strict90_analysis.json";
const FULL_SUFFIX = "_analysis.json";
const HIGH_SUFFIX = "_high90_analysis.json";

/** @param {string} stem */
export function isSafeSessionId(stem) {
  return typeof stem === "string" && /^[a-zA-Z0-9_-]+$/.test(stem) && stem.length > 0;
}

function humanTitle(stem) {
  return stem.replace(/_/g, " ");
}

/** @param {string} fileBase e.g. foo_strict90_analysis.json */
export function stemFromStrictFilename(fileBase) {
  if (!fileBase.endsWith(STRICT_SUFFIX)) return null;
  return fileBase.slice(0, -STRICT_SUFFIX.length);
}

/**
 * @param {unknown} data
 * @returns {data is { segments: object[], summary?: object, input_file?: string, model_threshold?: number }}
 */
function isAnalysisDoc(data) {
  return Boolean(data && typeof data === "object" && Array.isArray(data.segments));
}

export async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function listSessions() {
  const { resultsDir } = getManipConfig();
  let names;
  try {
    names = await fs.readdir(resultsDir);
  } catch (e) {
    if (e && e.code === "ENOENT") return [];
    throw e;
  }
  const strictFiles = names.filter((n) => n.endsWith(STRICT_SUFFIX));
  const sessions = await Promise.all(
    strictFiles.map(async (name) => {
      const stem = stemFromStrictFilename(name);
      if (!stem) return null;
      const fullPath = path.join(resultsDir, name);
      const st = await fs.stat(fullPath);
      const fullName = `${stem}${FULL_SUFFIX}`;
      const highName = `${stem}${HIGH_SUFFIX}`;
      const hasFull = names.includes(fullName);
      const hasHigh = names.includes(highName);
      return {
        id: stem,
        title: humanTitle(stem),
        strictPath: name,
        hasFull,
        hasHigh,
        modifiedAt: st.mtime.toISOString(),
      };
    }),
  );
  return sessions.filter(Boolean);
}

/**
 * @param {string} id session stem
 */
export async function loadSessionFiles(id) {
  if (!isSafeSessionId(id)) {
    const err = new Error("Invalid session id");
    err.statusCode = 400;
    throw err;
  }
  const { resultsDir } = getManipConfig();
  const strictPath = path.join(resultsDir, `${id}${STRICT_SUFFIX}`);
  const fullPath = path.join(resultsDir, `${id}${FULL_SUFFIX}`);
  const highPath = path.join(resultsDir, `${id}${HIGH_SUFFIX}`);

  let strict;
  try {
    strict = await readJsonFile(strictPath);
  } catch (e) {
    if (e && e.code === "ENOENT") {
      const err = new Error("Session not found");
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
  if (!isAnalysisDoc(strict)) {
    const err = new Error("Invalid analysis file");
    err.statusCode = 500;
    throw err;
  }

  let full = null;
  let high = null;
  try {
    full = await readJsonFile(fullPath);
  } catch {
    /* optional */
  }
  try {
    high = await readJsonFile(highPath);
  } catch {
    /* optional */
  }

  return { strict, full: isAnalysisDoc(full) ? full : null, high: isAnalysisDoc(high) ? high : null };
}

function scoreBuckets(segments) {
  const buckets = [
    { label: "0–19", min: 0, max: 19, count: 0 },
    { label: "20–39", min: 20, max: 39, count: 0 },
    { label: "40–59", min: 40, max: 59, count: 0 },
    { label: "60–79", min: 60, max: 79, count: 0 },
    { label: "80–100", min: 80, max: 100, count: 0 },
  ];
  for (const s of segments) {
    const idx = Number(s.manipulation_index) || 0;
    for (const b of buckets) {
      if (idx >= b.min && idx <= b.max) {
        b.count++;
        break;
      }
    }
  }
  return buckets;
}

export function buildSessionOverview(fullDoc, strictDoc) {
  const segmentsFull = fullDoc?.segments || [];
  const summaryFull = fullDoc?.summary || null;
  const summaryStrict = strictDoc?.summary || null;
  return {
    summaryFull,
    summaryStrict,
    buckets: segmentsFull.length ? scoreBuckets(segmentsFull) : [],
    totalSegmentsFull: segmentsFull.length,
    strictCount: strictDoc?.segments?.length ?? 0,
  };
}

function tagSegments(segments, sessionId, sessionTitle) {
  return segments.map((s, i) => ({
    ...s,
    sessionId,
    sessionTitle,
    _key: `${sessionId}-${s.index ?? i}`,
  }));
}

export async function getAggregate() {
  const sessions = await listSessions();
  const { resultsDir } = getManipConfig();
  const all = [];
  const sessionSummaries = [];

  for (const s of sessions) {
    const doc = await readJsonFile(path.join(resultsDir, s.strictPath));
    if (!isAnalysisDoc(doc)) continue;
    const tagged = tagSegments(doc.segments, s.id, s.title);
    all.push(...tagged);
    sessionSummaries.push({
      sessionId: s.id,
      sessionTitle: s.title,
      segmentCount: doc.segments.length,
      summary: doc.summary || null,
      input_file: doc.input_file,
    });
  }

  const manipulative = all.filter((x) => x.label === "manipulative").length;
  const avgScore =
    all.length > 0
      ? all.reduce((a, x) => a + (Number(x.score) || 0), 0) / all.length
      : 0;

  return {
    sessions: sessionSummaries,
    segments: all,
    totals: {
      sessionCount: sessions.length,
      segmentCount: all.length,
      manipulativeCount: manipulative,
      averageScore: avgScore,
    },
  };
}

function haystack(seg) {
  const parts = [
    seg.text,
    seg.speaker,
    seg.explanation,
    ...(seg.cue_matches || []).flatMap((c) => [c.term, c.technique]),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export async function searchAll(q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) return { query: q, hits: [] };

  const sessions = await listSessions();
  const { resultsDir } = getManipConfig();
  /** @type {object[]} */
  const hits = [];

  for (const s of sessions) {
    const doc = await readJsonFile(path.join(resultsDir, s.strictPath));
    if (!isAnalysisDoc(doc)) continue;
    for (const seg of doc.segments) {
      if (haystack(seg).includes(query)) {
        hits.push({
          ...seg,
          sessionId: s.id,
          sessionTitle: s.title,
          _key: `${s.id}-${seg.index}`,
        });
      }
    }
  }

  hits.sort(
    (a, b) => (Number(b.manipulation_index) || 0) - (Number(a.manipulation_index) || 0),
  );

  return { query: q, hits };
}

/** @param {string} originalName */
export function sanitizePdfStem(originalName) {
  const base = path.basename(originalName, path.extname(originalName));
  return base.replace(/[^a-zA-Z0-9_-]/g, "_") || "upload";
}
