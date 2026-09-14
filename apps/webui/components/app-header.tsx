"use client";

import { useEffect, useState } from "react";
import { PlugIcon, SettingsIcon, WandSparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConnectModal } from "@/components/connect-modal";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProviderIcon } from "@/lib/app-icons";
import { fetchWebmcpStatus, type ServiceStatus } from "@/lib/webmcp";
import { getConnections, saveConnections } from "@/lib/store";
import type { ProviderId } from "@/lib/foundercycle";

interface Props {
  founderName: string;
  onProcessNext?: () => void;
  processing?: boolean;
}

export function AppHeader({ founderName, onProcessNext, processing }: Props) {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [name, setName] = useState(founderName);

  useEffect(() => setName(founderName), [founderName]);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((rows: { provider: string; status: string }[]) => {
        const map: Record<string, boolean> = {};
        for (const r of rows) map[r.provider] = r.status === "connected";
        setConnections(map);
        saveConnections(map);
      })
      .catch(() => setConnections(getConnections()));
    fetchWebmcpStatus().then(setServices);
    const t = setInterval(() => fetchWebmcpStatus().then(setServices), 30000);
    return () => clearInterval(t);
  }, []);

  const live = services.filter((s) => s.ok).length;

  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between bg-background px-4">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          {name ? name.charAt(0).toUpperCase() : "F"}
        </span>
        <div className="leading-tight">
          <div className="font-heading text-sm font-semibold">
            {name ? `${name}'s FounderCycle` : "FounderCycle"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {live}/{services.length || 5} apps live
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm">
                <span
                  className={`size-2 rounded-full ${
                    live > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                WebMCP
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {services.map((s) => (
              <DropdownMenuItem key={s.provider}>
                <ProviderIcon provider={s.provider as ProviderId} />
                {s.label}
                <span className="ml-auto text-muted-foreground">
                  {s.ok ? `${s.latencyMs}ms` : "off"}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onProcessNext && (
          <Button size="sm" onClick={onProcessNext} disabled={processing}>
            <WandSparklesIcon />
            {processing ? "Working…" : "Process next"}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setConnectOpen(true)}>
          <PlugIcon />
          <span className="hidden sm:inline">Connect</span>
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          <SettingsIcon />
        </Button>
      </div>

      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        connections={connections}
        onSave={(c) => {
          setConnections(c);
          fetchWebmcpStatus().then(setServices);
        }}
      />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onProfileSaved={(n) => setName(n)}
      />
    </header>
  );
}
