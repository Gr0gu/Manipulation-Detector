import Link from "next/link";
import { listSessions } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await listSessions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Ședințe parlamentare</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Fiecare intrare corespunde unui PDF analizat; detaliile includ fragmentele strict filtrate
          și, dacă există, analiza completă pentru statistici.
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Niciun fișier `*_strict90_analysis.json` în folderul de rezultate. Configurați
          MANIP_RESULTS_DIR sau rulați pipeline-ul.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/sessions/${encodeURIComponent(s.id)}`}
                    className="text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                </CardTitle>
                <CardDescription className="font-mono text-xs">ID: {s.id}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  {s.hasFull ? <Badge variant="secondary">Analiză completă</Badge> : null}
                  {s.hasHigh ? <Badge variant="outline">High90 disponibil</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
                Modificat: {new Date(s.modifiedAt).toLocaleString("ro-MD")}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
