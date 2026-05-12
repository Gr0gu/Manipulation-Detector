"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatementBrowser } from "@/components/statement-browser";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function tagSegments(strict, sessionId) {
  const title = sessionId.replace(/_/g, " ");
  return (strict?.segments || []).map((s, i) => ({
    ...s,
    sessionId,
    sessionTitle: title,
    _key: `${sessionId}-${s.index ?? i}`,
  }));
}

export default function AnalyzePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [previewSegments, setPreviewSegments] = useState(null);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setSessionId(null);
    setPreviewSegments(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");
    if (!file || typeof file === "string") {
      setError("Selectați un fișier PDF.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Eroare HTTP ${res.status}`);
      }
      setSessionId(data.sessionId);
      setPreviewSegments(tagSegments(data.strict, data.sessionId));
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err.message || "Analiza a eșuat.");
    } finally {
      setBusy(false);
    }
  }, [router]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Încărcare PDF</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Fișierul este trimis la server; se rulează `manip_detector pipeline` în directorul backend
          (necesită Python pentru extragerea textului). Rezultatele se scriu în folderul de rezultate
          și apar în listă după reîmprospătare.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="file">Stenogramă PDF</Label>
          <Input id="file" name="file" type="file" accept="application/pdf,.pdf" required disabled={busy} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Se analizează…" : "Pornește analiza"}
        </Button>
      </form>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Eroare</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap break-words">{error}</AlertDescription>
        </Alert>
      ) : null}

      {sessionId && previewSegments ? (
        <div className="flex flex-col gap-4">
          <Separator />
          <Alert>
            <AlertTitle>Analiză finalizată</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span>
                Sesiune nouă: <span className="font-mono text-foreground">{sessionId}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/sessions/${encodeURIComponent(sessionId)}`}
                  className={cn(buttonVariants({ variant: "secondary" }))}
                >
                  Deschide pagina sesiunii
                </Link>
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Rezumat general
                </Button>
              </div>
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-semibold">Previzualizare fragmente (strict)</h2>
            <StatementBrowser segments={previewSegments} showSessionFilters={false} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
