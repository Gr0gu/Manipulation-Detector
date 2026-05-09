"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StatementCard } from "@/components/statement-card";
import { severityFromIndex } from "@/lib/severity";
import { cn } from "@/lib/utils";

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function matchesSeverity(filterKey, segment) {
  if (filterKey === "all") return true;
  return severityFromIndex(segment.manipulation_index) === filterKey;
}

function matchesTechnique(filterKey, segment) {
  if (filterKey === "all") return true;
  return (segment.cue_matches || []).some((c) => c.technique === filterKey);
}

function sortSegments(list, sortKey) {
  const out = [...list];
  out.sort((a, b) => {
    switch (sortKey) {
      case "index_asc":
        return (Number(a.manipulation_index) || 0) - (Number(b.manipulation_index) || 0);
      case "speaker_asc":
        return (a.speaker || "").localeCompare(b.speaker || "", "ro");
      case "session_asc":
        return (a.sessionTitle || "").localeCompare(b.sessionTitle || "", "ro");
      case "index_desc":
      default:
        return (Number(b.manipulation_index) || 0) - (Number(a.manipulation_index) || 0);
    }
  });
  return out;
}

export function StatementBrowser({ segments, showSessionFilters = true }) {
  const [speaker, setSpeaker] = useState("all");
  const [technique, setTechnique] = useState("all");
  const [label, setLabel] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sortKey, setSortKey] = useState("index_desc");
  const [sessionId, setSessionId] = useState("all");

  const speakers = useMemo(
    () => uniqueSorted(segments.map((s) => s.speaker)),
    [segments],
  );
  const techniques = useMemo(() => {
    const t = new Set();
    for (const s of segments) {
      for (const c of s.cue_matches || []) t.add(c.technique);
    }
    return [...t].sort((a, b) => a.localeCompare(b));
  }, [segments]);
  const sessionIds = useMemo(
    () => uniqueSorted(segments.map((s) => s.sessionId).filter(Boolean)),
    [segments],
  );

  const filtered = useMemo(() => {
    let list = segments;
    if (speaker !== "all") list = list.filter((s) => s.speaker === speaker);
    if (label !== "all") list = list.filter((s) => s.label === label);
    if (technique !== "all") list = list.filter((s) => matchesTechnique(technique, s));
    if (severity !== "all") list = list.filter((s) => matchesSeverity(severity, s));
    if (showSessionFilters && sessionId !== "all") {
      list = list.filter((s) => s.sessionId === sessionId);
    }
    return sortSegments(list, sortKey);
  }, [segments, speaker, label, technique, severity, sessionId, sortKey, showSessionFilters]);

  const filterControls = (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="sort">Sortare</Label>
        <Select value={sortKey} onValueChange={setSortKey}>
          <SelectTrigger id="sort" className="w-full min-w-[200px] md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="index_desc">Indice (descrescător)</SelectItem>
              <SelectItem value="index_asc">Indice (crescător)</SelectItem>
              <SelectItem value="speaker_asc">Vorbitor (A–Z)</SelectItem>
              {showSessionFilters ? (
                <SelectItem value="session_asc">Ședință (A–Z)</SelectItem>
              ) : null}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="speaker">Vorbitor</Label>
        <Select value={speaker} onValueChange={setSpeaker}>
          <SelectTrigger id="speaker" className="w-full min-w-[200px] md:w-56">
            <SelectValue placeholder="Toți" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Toți</SelectItem>
              {speakers.map((sp) => (
                <SelectItem key={sp} value={sp}>
                  {sp}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="technique">Tehnică</Label>
        <Select value={technique} onValueChange={setTechnique}>
          <SelectTrigger id="technique" className="w-full min-w-[200px] md:w-56">
            <SelectValue placeholder="Toate" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Toate</SelectItem>
              {techniques.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="label">Etichetă model</Label>
        <Select value={label} onValueChange={setLabel}>
          <SelectTrigger id="label" className="w-full min-w-[200px] md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="manipulative">Manipulative</SelectItem>
              <SelectItem value="neutral">Neutre</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="severity">Severitate</Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger id="severity" className="w-full min-w-[200px] md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="high">90–100</SelectItem>
              <SelectItem value="warning">70–89</SelectItem>
              <SelectItem value="review">50–69</SelectItem>
              <SelectItem value="low">0–49</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {showSessionFilters ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="session">Ședință</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger id="session" className="w-full min-w-[200px] md:w-56">
              <SelectValue placeholder="Toate" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Toate</SelectItem>
                {sessionIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="hidden md:block bg-card p-4 rounded-xl border border-border/60 shadow-sm">{filterControls}</div>
      <Collapsible className="flex flex-col gap-2 md:hidden">
        <CollapsibleTrigger
          type="button"
          className={cn(buttonVariants({ variant: "outline" }), "w-full shadow-sm")}
        >
          Filtre și sortare
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
          {filterControls}
        </CollapsibleContent>
      </Collapsible>
      <p className="text-muted-foreground text-sm font-medium px-1">
        Afișate {filtered.length} din {segments.length} fragmente (filtru strict 90 + dovezi).
      </p>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {filtered.map((s, index) => (
          <div key={s._key || `${s.sessionId}-${s.index}`} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
            <StatementCard segment={s} />
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm p-8 text-center border border-dashed rounded-xl bg-muted/20">Niciun fragment nu corespunde filtrelor.</p>
      ) : null}
    </div>
  );
}
