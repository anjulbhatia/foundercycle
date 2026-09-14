"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ChatPanel } from "@/components/chat-panel";
import { KanbanColumn } from "@/components/kanban-column";
import { getProfile } from "@/lib/store";
import type { KanbanCard } from "@/lib/foundercycle";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push("/onboarding");
      return;
    }
    setName(p.name);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const planned = cards.filter((c) => c.column === "planned");
  const ongoing = cards.filter((c) => c.column === "ongoing");
  const completed = cards.filter((c) => c.column === "completed");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader founderName={name} />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-4 mx-1 my-1 rounded-2xl">
        <div className="flex min-h-0 flex-col rounded-xl border bg-card p-2">
          <div className="flex items-center gap-2 px-1 py-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium">Assistant</span>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel
              onCreate={(c) => setCards((prev) => [c, ...prev])}
            />
          </div>
        </div>
        <div className="min-h-0">
          <KanbanColumn title="Planned" cards={planned} />
        </div>
        <div className="min-h-0">
          <KanbanColumn title="Ongoing" cards={ongoing} />
        </div>
        <div className="min-h-0">
          <KanbanColumn title="Completed" cards={completed} />
        </div>
      </main>
    </div>
  );
}
