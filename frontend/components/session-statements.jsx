"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatementBrowser } from "@/components/statement-browser";

function tag(list, sessionId, sessionTitle) {
  return list.map((s, i) => ({
    ...s,
    sessionId,
    sessionTitle,
    _key: `${sessionId}-${s.index ?? i}`,
  }));
}

export function SessionStatements({ sessionId, sessionTitle, strictSegments, highSegments }) {
  const [mode, setMode] = useState("strict");
  const source = mode === "strict" ? strictSegments : highSegments;
  const segments = tag(source, sessionId, sessionTitle);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "strict" ? "default" : "outline"}
          onClick={() => setMode("strict")}
        >
          Strict (90 + dovezi)
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "high" ? "default" : "outline"}
          onClick={() => setMode("high")}
        >
          Toate peste 90
        </Button>
      </div>
      <StatementBrowser segments={segments} showSessionFilters={false} />
    </div>
  );
}
