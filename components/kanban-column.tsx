"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KanbanCard } from "@/lib/foundercycle";

interface Props {
  title: string;
  cards: KanbanCard[];
}

export function KanbanColumn({ title, cards }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">{title}</div>
      <ScrollArea className="fc-scroll min-h-0 flex-1 px-2 py-2">
        <div className="flex flex-col gap-2">
          {cards.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground">Empty</p>
          )}
          {cards.map((c) => (
            <Card key={c.id} size="sm" className="rounded-lg">
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{c.type}</Badge>
                {c.summary && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
