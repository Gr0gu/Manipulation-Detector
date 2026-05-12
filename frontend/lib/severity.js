export function severityFromIndex(value) {
  const n = Number(value) || 0;
  if (n >= 90) return "high";
  if (n >= 70) return "warning";
  if (n >= 50) return "review";
  return "low";
}

export function severityLabelRo(key) {
  switch (key) {
    case "high":
      return "Alertă ridicată";
    case "warning":
      return "Avertisment";
    case "review":
      return "Revizuire";
    default:
      return "Scăzut";
  }
}
