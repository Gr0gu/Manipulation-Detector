import path from "path";

/**
 * @returns {{ root: string, exe: string, resultsDir: string }}
 */
export function getManipConfig() {
  const cwd = process.cwd();
  
  let root = process.env.MANIP_DETECTOR_ROOT;
  if (!root) {
    if (path.basename(cwd) === "frontend") {
      root = path.resolve(cwd, "..", "backend");
    } else {
      root = path.join(cwd, "backend");
    }
  }

  const exe =
    process.env.MANIP_DETECTOR_EXE ||
    path.join(root, "build", "Release", "manip_detector.exe");

  const resultsDir =
    process.env.MANIP_RESULTS_DIR || path.join(root, "data", "results");

  return { root, exe, resultsDir };
}
