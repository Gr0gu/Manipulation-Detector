import Link from "next/link";
import { getAggregate } from "@/lib/data";
import { StatementBrowser } from "@/components/statement-browser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data;
  let errorMessage = null;
  try {
    data = await getAggregate();
  } catch (e) {
    errorMessage = e.message || "Nu s-au putut încărca datele.";
    data = { segments: [], sessions: [], totals: { sessionCount: 0, segmentCount: 0, manipulativeCount: 0, averageScore: 0 } };
  }

  const { segments, sessions, totals } = data;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Rezumat</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Fragmente cu scor ridicat și dovezi lexicale din analiza automată a stenogramelor. Folosiți
          filtrele pentru a explora pe vorbitor, tehnică sau severitate.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Eroare la citirea rezultatelor</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {!errorMessage && totals.sessionCount === 0 ? (
        <Alert>
          <AlertTitle>Nu există încă analize</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>
              Rulați pipeline-ul din backend sau încărcați un PDF aici:{" "}
              <Link href="/analyze" className="text-primary font-medium underline underline-offset-4">
                Încarcă PDF
              </Link>
              .
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/40 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Ședințe indexate</CardTitle>
            <CardDescription>Fișiere strict90</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-primary">
            {totals.sessionCount}
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/40 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Fragmente (strict)</CardTitle>
            <CardDescription>În toate sesiunile</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-primary">
            {totals.segmentCount}
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/40 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Etichetate manipulative</CardTitle>
            <CardDescription>Model NB</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-primary">
            {totals.manipulativeCount}
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/40 group">
          <CardHeader>
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Scor mediu</CardTitle>
            <CardDescription>Pe fragmentele afișate</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-primary">
            {totals.segmentCount ? totals.averageScore.toFixed(3) : "—"}
          </CardContent>
        </Card>
      </div>

      {sessions.length > 0 ? (
        <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base text-primary">Sesiuni recente</CardTitle>
            <CardDescription>Legături rapide către fiecare ședință analizată</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sessions.map((s) => (
              <Link
                key={s.sessionId}
                href={`/sessions/${encodeURIComponent(s.sessionId)}`}
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                {s.sessionTitle} ({s.segmentCount} fragmente)
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Fragmente</h2>
        <StatementBrowser segments={segments} showSessionFilters />
      </div>
    </div>
  );
}
