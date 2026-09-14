"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "@/components/kanban-card";
import type { KanbanCard as CardData, ColumnId } from "@/lib/foundercycle";

interface Props {
  title: string;
  dot: string;
  column: ColumnId;
  cards: CardData[];
  onAdvance: (id: string) => void;
  onQuickAdd: (column: ColumnId, title: string) => void;
}

export function KanbanColumn({ title, dot, column, cards, onAdvance, onQuickAdd }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onQuickAdd(column, t);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-muted/40 p-2">
      <div className="flex items-center gap-2 px-2 pt-1 pb-2">
        <span className={`size-2 rounded-full ${dot}`} />
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <ScrollArea className="fc-scroll min-h-0 flex-1 px-1">
        <div className="flex flex-col gap-2 pb-1">
          {cards.map((c) => (
            <KanbanCard key={c.id} card={c} onAdvance={onAdvance} />
          ))}
          {cards.length === 0 && !adding && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Nothing here yet
            </p>
          )}
        </div>
      </ScrollArea>
      {adding ? (
        <div className="flex items-center gap-1 px-1 pt-2">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Card title…"
            className="h-8 rounded-xl border-0 bg-card shadow-xs"
          />
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            Add
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 justify-start text-muted-foreground"
          onClick={() => setAdding(true)}
        >
          <PlusIcon />
          Add new
        </Button>
      )}
    </div>
  );
}
