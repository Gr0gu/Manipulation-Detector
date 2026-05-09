import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SessionOverview({ overview }) {
  if (!overview) return null;
  const { buckets, summaryFull, summaryStrict, totalSegmentsFull, strictCount } = overview;
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rezumat analiză completă</CardTitle>
          <CardDescription>Toate fragmentele scanate din stenogramă</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {summaryFull ? (
            <ul className="text-muted-foreground flex flex-col gap-1">
              <li>Total fragmente: {summaryFull.total_segments ?? totalSegmentsFull}</li>
              <li>Manipulative (model): {summaryFull.manipulative_segments}</li>
              <li>Neutre: {summaryFull.neutral_segments}</li>
              <li>Scor mediu: {Number(summaryFull.average_score || 0).toFixed(4)}</li>
            </ul>
          ) : (
            <p className="text-muted-foreground">
              Fișierul complet `*_analysis.json` lipsește; reconstruiți cu pipeline pentru grafice
              complete.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fragmente afișate (strict)</CardTitle>
          <CardDescription>Indice ridicat și cel puțin un cue puternic</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {summaryStrict ? (
            <ul className="text-muted-foreground flex flex-col gap-1">
              <li>Scanate: {summaryStrict.total_segments_scanned}</li>
              <li>Incluse (strict): {summaryStrict.included_segments}</li>
              <li>Din care manipulative: {summaryStrict.included_manipulative_segments}</li>
            </ul>
          ) : null}
          <p className="text-foreground font-medium">În UI: {strictCount} carduri</p>
        </CardContent>
      </Card>
      {buckets.length ? (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distribuție indice manipulare</CardTitle>
            <CardDescription>Fragmente din analiza completă (0–100)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {buckets.map((b) => (
              <div key={b.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span>{b.label}</span>
                  <span className="tabular-nums">{b.count}</span>
                </div>
                <Progress value={(b.count / maxBucket) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
