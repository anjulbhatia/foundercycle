"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onProfileSaved?: (name: string) => void;
}

export function SettingsModal({ open, onOpenChange, onProfileSaved }: Props) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [model, setModel] = useState("auto");
  const [approvalAuto, setApprovalAuto] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p) {
          setName(p.name ?? "");
          setContext(p.context ?? "");
        }
      })
      .catch(() => {});
    fetch("/api/agent/config")
      .then((r) => r.json())
      .then((c) => {
        setModel(c.model ?? "auto");
        setApprovalAuto(c.approval_mode === "auto");
        setThreshold(c.review_threshold ?? 0.5);
      })
      .catch(() => {});
  }, [open ]);

  async function save() {
    if (name.trim()) {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), context }),
      }).catch(() => {});
      onProfileSaved?.(name.trim());
    }
    await fetch("/api/agent/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        approval_mode: approvalAuto ? "auto" : "manual",
        review_threshold: threshold,
      }),
    }).catch(() => {});
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Profile and agent behavior. Stored in ~/.foundercycle.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="agent">Agent</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Founder name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Context</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                placeholder="Company, focus, timezone…"
              />
            </div>
          </TabsContent>
          <TabsContent value="agent" className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Model</Label>
                <p className="text-[11px] text-muted-foreground">Auto picks cheapest capable.</p>
              </div>
              <Select value={model} onValueChange={(v) => setModel(v ?? "auto")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="gpt-5">GPT-5</SelectItem>
                  <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                  <SelectItem value="gemini-flash">Gemini Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Auto-send approved mail</Label>
                <p className="text-[11px] text-muted-foreground">
                  Off = drafts only. Hard rule stays.
                </p>
              </div>
              <Switch checked={approvalAuto} onCheckedChange={setApprovalAuto} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Review threshold</Label>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {(threshold * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[threshold * 100]}
                onValueChange={(v) => {
                  const n = Array.isArray(v) ? v[0] : v;
                  setThreshold((n ?? 50) / 100);
                }}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-[11px] text-muted-foreground">
                Below this confidence cards stay for review.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <Button onClick={save}>{saved ? "Saved" : "Save settings"}</Button>
      </DialogContent>
    </Dialog>
  );
}
