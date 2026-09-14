"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PROVIDERS } from "@/lib/foundercycle";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  connections: Record<string, boolean>;
  onSave: (c: Record<string, boolean>) => void;
}

export function ConnectModal({ open, onOpenChange, connections, onSave }: Props) {
  const [draft, setDraft] = useState(connections);

  function toggle(id: string) {
    setDraft((d) => ({ ...d, [id]: !d[id] }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect apps</DialogTitle>
          <DialogDescription>
            Toggle connections. OAuth wiring comes later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <span className="text-sm font-medium">{p.label}</span>
              <Switch
                checked={!!draft[p.id]}
                onCheckedChange={() => toggle(p.id)}
              />
            </div>
          ))}
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
