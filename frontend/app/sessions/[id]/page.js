import Link from "next/link";
import { notFound } from "next/navigation";
import { loadSessionFiles, isSafeSessionId, buildSessionOverview } from "@/lib/data";
import { SessionOverview } from "@/components/session-overview";
import { SessionStatements } from "@/components/session-statements";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }) {
  const { id } = await params;
  if (!isSafeSessionId(id)) {
    notFound();
  }

  let bundle;
  try {
    bundle = await loadSessionFiles(id);
  } catch (e) {
    if (e.statusCode === 404) notFound();
    throw e;
  }

  const { strict, full, high } = bundle;
  const overview = buildSessionOverview(full, strict);
  const sessionTitle = id.replace(/_/g, " ");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/sessions"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            ← Toate ședințele
          </Link>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{sessionTitle}</h1>
        {strict.input_file ? (
          <p className="text-muted-foreground font-mono text-xs break-all">{strict.input_file}</p>
        ) : null}
      </div>

      <SessionOverview overview={overview} />

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Fragmente</h2>
        <SessionStatements
          sessionId={id}
          sessionTitle={sessionTitle}
          strictSegments={strict.segments || []}
          highSegments={high?.segments || []}
        />
      </div>
    </div>
  );
}
