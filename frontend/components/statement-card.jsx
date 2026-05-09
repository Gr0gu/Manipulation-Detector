"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { guidanceForTechniques } from "@/lib/technique-guidance";
import { severityFromIndex, severityLabelRo } from "@/lib/severity";

import { HighlightText } from "@/components/highlight-text";

export function StatementCard({ segment, highlightQuery }) {
  const [openTerms, setOpenTerms] = useState(false);
  const [openText, setOpenText] = useState(false);
  const techniques = (segment.cue_matches || []).map((c) => c.technique);
  const guidance = guidanceForTechniques(techniques);
  const sev = severityFromIndex(segment.manipulation_index);
  const idx = Math.min(100, Math.max(0, Number(segment.manipulation_index) || 0));

  const sessionLine = segment.sessionTitle ? (
    <CardDescription>
      Ședință:{" "}
      <span className="text-foreground">{segment.sessionTitle}</span>
    </CardDescription>
  ) : null;

  return (
    <Card className="transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 animate-in fade-in zoom-in-95 duration-500 fill-mode-both border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base text-card-foreground">{segment.speaker}</CardTitle>
              {sessionLine}
            </div>
            <Badge variant="outline" className={`shrink-0 self-start shadow-sm transition-colors ${
              sev === 'high' ? 'border-destructive text-destructive bg-destructive/10' : 
              sev === 'warning' ? 'border-orange-500 text-orange-600 bg-orange-500/10' : 
              'border-primary/50 text-primary bg-primary/10'
            }`}>
              {severityLabelRo(sev)}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Indice manipulare</span>
              <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${idx >= 70 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>{idx.toFixed(0)}</span>
            </div>
            <Progress value={idx} aria-valuetext={`${idx}%`} className="h-2 shadow-inner" />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(segment.cue_matches || []).map((c) => (
              <Badge key={`${c.term}-${c.technique}`} variant="secondary" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-secondary transition-colors cursor-default">
                {c.term}
              </Badge>
            ))}
            <Badge variant={segment.label === "manipulative" ? "destructive" : "default"} className="shadow-sm">
              {segment.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-5">
        <p className="text-muted-foreground text-sm leading-relaxed">{segment.explanation}</p>
        {guidance ? (
          <p className="text-sm leading-relaxed bg-accent/30 p-3 rounded-md border border-accent">
            <span className="font-semibold text-accent-foreground">💡 Recomandare: </span>
            {guidance}
          </p>
        ) : null}
        <Separator className="my-2" />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={openText ? "secondary" : "outline"}
            size="sm"
            className="self-start transition-all hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary/50 shadow-sm"
            onClick={() => setOpenText((v) => !v)}
          >
            {openText ? "Ascunde fragmentul" : "Arată fragmentul transcris"}
          </Button>
          {openText ? (
            <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed border border-border shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
              {highlightQuery ? (
                <HighlightText text={segment.text} query={highlightQuery} />
              ) : (
                segment.text
              )}
            </div>
          ) : null}
        </div>
        {(segment.top_model_terms || []).length > 0 ? (
          <div className="flex flex-col gap-2 mt-1">
            <Button
              type="button"
              variant={openTerms ? "secondary" : "ghost"}
              size="sm"
              className="self-start transition-all hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              onClick={() => setOpenTerms((v) => !v)}
            >
              {openTerms ? "Ascunde termenii model" : "Afișează termeni importanți (model)"}
            </Button>
            {openTerms ? (
              <ul className="text-muted-foreground flex flex-col gap-1.5 text-xs bg-muted/30 p-3 rounded-md border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                {segment.top_model_terms.map((t) => (
                  <li key={t.term} className="flex justify-between gap-2 border-b border-border/50 pb-1 last:border-0 last:pb-0">
                    <span className="font-medium">{t.term}</span>
                    <span className="tabular-nums opacity-80">{Number(t.impact).toFixed(4)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="text-muted-foreground bg-muted/10 flex flex-wrap gap-4 text-xs py-3 border-t">
        <span className="flex items-center gap-1"><span className="opacity-60">Tokeni:</span> <span className="font-medium">{segment.token_count}</span></span>
        <span className="flex items-center gap-1"><span className="opacity-60">Cue puternice:</span> <span className="font-medium">{segment.strong_cue_count}</span></span>
        <span className="flex items-center gap-1 ml-auto"><span className="opacity-60">Index ref:</span> {segment.index}</span>
      </CardFooter>
    </Card>
  );
}
