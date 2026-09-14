"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ChatPanel } from "@/components/chat-panel";
import { KanbanColumn } from "@/components/kanban-column";
import { getProfile } from "@/lib/store";
import type { CardType, ColumnId, KanbanCard } from "@/lib/foundercycle";
import { NEXT_COLUMN } from "@/lib/foundercycle";

interface Row {
  id: number;
  title: string;
  type: string;
  status: string;
  summary: string;
  created_at: string;
}

const VALID_TYPES: CardType[] = ["meeting", "task", "bug", "idea", "follow-up"];
const VALID_COLUMNS: ColumnId[] = ["planned", "ongoing", "completed"];

function toCard(r: Row): KanbanCard {
  return {
    id: String(r.id),
    title: r.title,
    type: VALID_TYPES.includes(r.type as CardType) ? (r.type as CardType) : "task",
    column: VALID_COLUMNS.includes(r.status as ColumnId)
      ? (r.status as ColumnId)
      : "planned",
    summary: r.summary || undefined,
    createdAt: r.created_at,
  };
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const rows = (await fetch("/api/cards", { cache: "no-store" }).then((r) =>
        r.json()
      )) as Row[];
      setCards(rows.map(toCard));
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = (await fetch("/api/profile", { cache: "no-store" }).then((r) =>
          r.json()
        )) as { name?: string } | null;
        if (!cancelled && p?.name) {
          setName(p.name);
          setReady(true);
          return;
        }
      } catch {}
      const local = getProfile();
      if (!cancelled) {
        if (!local) router.push("/onboarding");
        else {
          setName(local.name);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (ready) reload();
  }, [ready, reload]);

  async function handleCreate(c: KanbanCard) {
    try {
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: c.title, type: c.type, status: "planned" }),
      });
      await reload();
    } catch {
      setCards((prev) => [c, ...prev]);
    }
  }

  async function handleAdvance(id: string) {
    const card = cards.find((c) => c.id === id);
    const next = card ? NEXT_COLUMN[card.column] : null;
    if (!card || !next) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: next } : c)));
    try {
      await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: next }),
      });
      await reload();
    } catch {}
  }

  async function handleMove(id: string, column: ColumnId) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.column === column) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column } : c)));
    try {
      await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status: column }),
      });
      await reload();
    } catch {}
  }

  async function handleProcessNext() {
    setProcessing(true);
    try {
      await fetch("/api/agent/process-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await reload();
    } finally {
      setProcessing(false);
    }
  }

  if (!ready) return null;

  const planned = cards.filter((c) => c.column === "planned");
  const ongoing = cards.filter((c) => c.column === "ongoing");
  const completed = cards.filter((c) => c.column === "completed");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader
        founderName={name}
        onProcessNext={handleProcessNext}
        processing={processing}
      />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-3 pb-3 md:grid-cols-4">
        <div className="flex min-h-0 flex-col rounded-2xl bg-muted/40 p-2">
          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-[13px] font-semibold">Assistant</span>
          </div>
          <div className="min-h-0 flex-1 px-1">
            <ChatPanel onCreate={handleCreate} />
          </div>
        </div>
        <div className="min-h-0">
          <KanbanColumn
            title="Tasks"
            column="planned"
            cards={planned}
            onAdvance={handleAdvance}
            onMove={handleMove}
            onQuickAdd={(_, title) =>
              handleCreate({ id: crypto.randomUUID(), title, type: "task", column: "planned" })
            }
          />
        </div>
        <div className="min-h-0">
          <KanbanColumn
            title="Running"
            column="ongoing"
            cards={ongoing}
            onAdvance={handleAdvance}
            onMove={handleMove}
            onQuickAdd={(_, title) =>
              handleCreate({ id: crypto.randomUUID(), title, type: "task", column: "planned" })
            }
          />
        </div>
        <div className="min-h-0">
          <KanbanColumn
            title="Done"
            column="completed"
            cards={completed}
            onAdvance={handleAdvance}
            onMove={handleMove}
            onQuickAdd={(_, title) =>
              handleCreate({ id: crypto.randomUUID(), title, type: "task", column: "planned" })
            }
          />
        </div>
      </main>
    </div>
  );
}
