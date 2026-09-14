"use client";

import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderIcon } from "@/lib/app-icons";
import {
  NEXT_COLUMN,
  PIPELINES,
  STAGE_INDEX,
  type KanbanCard as CardData,
} from "@/lib/foundercycle";
import { cn } from "cn";

const TYPE_LABEL: Record<CardData["type"], string> = {
  meeting: "meeting",
  task: "task",
  bug: "bug",
  idea: "idea",
  "follow-up": "follow-up",
};

export function KanbanCard({
  card,
  onAdvance,
}: {
  card: CardData;
  onAdvance: (id: string) => void;
}) {
  const pipeline = PIPELINES[card.type];
  const active = STAGE_INDEX[card.column];
  const next = NEXT_COLUMN[card.column];
  const doneCount = Math.min(active, pipeline.length);

  return (
    <Card size="sm" className="rounded-lg transition-shadow hover:shadow-sm">
      <CardContent className="flex flex-col gap-2 py-2.5">
        <div className="flex items-center justify-between gap-1">
          <Badge variant="secondary">{TYPE_LABEL[card.type]}</Badge>
          {next && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onAdvance(card.id)}
              aria-label={`Move to ${next}`}
              title={`Move to ${next}`}
            >
              <ArrowRightIcon />
            </Button>
          )}
        </div>

        <p className="text-xs leading-snug font-medium">{card.title}</p>

        {card.summary && (
          <p className="text-[11px] leading-snug text-muted-foreground">
            {card.summary}
          </p>
        )}

        <div className="flex items-center gap-1 pt-0.5" aria-label="Process stage">
          {pipeline.map((provider, i) => {
            const done = i < doneCount;
            const current = i === doneCount && next !== null;
            return (
              <span key={provider} className="flex items-center gap-1">
                {i > 0 && (
                  <span
                    className={cn(
                      "h-px w-3",
                      i <= doneCount ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <span
                  title={provider}
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-full border",
                    done && "border-primary bg-primary/10",
                    current && "border-primary ring-2 ring-primary/30",
                    !done && !current && "border-border bg-muted/50 opacity-70"
                  )}
                >
                  <ProviderIcon provider={provider} className="size-3.5" />
                  {done && (
                    <span className="absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-2" />
                    </span>
                  )}
                </span>
              </span>
            );
          })}
          <span className="ml-1 text-[10px] text-muted-foreground">
            {next === null
              ? "Done"
              : `Stage ${doneCount + 1}/${pipeline.length}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
