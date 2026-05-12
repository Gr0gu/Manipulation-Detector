import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

/**
 * @param {string} exe
 * @param {string} pdfAbsPath
 * @param {string} resultsAbsDir
 * @param {string} cwd backend root
 */
export function runPipeline(exe, pdfAbsPath, resultsAbsDir, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(exe, ["pipeline", pdfAbsPath, resultsAbsDir], {
      cwd,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";
    child.stdout?.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else {
        const err = new Error(`Pipeline exited with code ${code}`);
        err.stderr = stderr;
        err.stdout = stdout;
        reject(err);
      }
    });
  });
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeUploadBuffer(destPath, buffer) {
  await ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, buffer);
}

export async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
