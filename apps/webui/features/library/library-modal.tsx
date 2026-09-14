"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Idea {
  id: number;
  title: string;
  project: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LibraryModal({ open, onOpenChange }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [cards, projects] = await Promise.all([
          fetch("/api/cards", { cache: "no-store" }).then((r) => r.json()) as Promise<
            { id: number; title: string; type: string; project_id: number }[]
          >,
          fetch("/api/projects", { cache: "no-store" }).then((r) => r.json()) as Promise<
            { id: number; name: string }[]
          >,
        ]);
        const names = new Map(projects.map((p) => [p.id, p.name]));
        setIdeas(
          cards
            .filter((c) => c.type === "idea")
            .map((c) => ({
              id: c.id,
              title: c.title,
              project: names.get(c.project_id) ?? "Unknown",
            }))
        );
      } catch {}
    })();
  }, [open ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Library</DialogTitle>
          <DialogDescription>Every captured idea, across projects.</DialogDescription>
        </DialogHeader>
        <div className="fc-scroll flex max-h-80 flex-col gap-2 overflow-y-auto">
          {ideas.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No ideas yet. Prefix a card with “Idea:”.
            </p>
          )}
          {ideas.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{i.title}</span>
              <Badge variant="secondary">{i.project}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
