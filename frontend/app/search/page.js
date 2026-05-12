import Link from "next/link";
import { searchAll } from "@/lib/data";
import { StatementCard } from "@/components/statement-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const { hits, query } = await searchAll(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Rezultate căutare</h1>
        {q ? (
          <p className="text-muted-foreground text-sm">
            Interogare: <span className="text-foreground font-medium">{query}</span> —{" "}
            {hits.length} rezultate
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">Introduceți un termen în bara de căutare.</p>
        )}
      </div>

      {!q ? (
        <Alert>
          <AlertTitle>Căutare goală</AlertTitle>
          <AlertDescription>
            Folosiți câmpul din antet sau accesați{" "}
            <Link href="/" className="text-primary underline underline-offset-4">
              pagina principală
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {hits.map((h) => (
          <div key={h._key} className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs">
              <Link
                href={`/sessions/${encodeURIComponent(h.sessionId)}`}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {h.sessionTitle}
              </Link>
            </p>
            <StatementCard segment={h} highlightQuery={q} />
          </div>
        ))}
      </div>
    </div>
  );
}
