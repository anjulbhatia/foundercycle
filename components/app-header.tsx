"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PlugIcon, UserIcon } from "lucide-react";
import { ConnectModal } from "@/components/connect-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchWebmcpStatus, type ServiceStatus } from "@/lib/webmcp";
import { getConnections, saveConnections } from "@/lib/store";

interface Props {
  founderName: string;
}

export function AppHeader({ founderName }: Props) {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setConnections(getConnections());
    fetchWebmcpStatus().then(setServices);
    const t = setInterval(() => fetchWebmcpStatus().then(setServices), 30000);
    return () => clearInterval(t);
  }, []);

  const allOk = services.length > 0 && services.every((s) => s.ok);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2 font-heading text-sm font-semibold">
        <span className="flex size-6 items-center justify-center rounded-none bg-primary text-xs font-bold text-primary-foreground">
          {founderName ? founderName.charAt(0).toUpperCase() : "F"}
        </span>
        {founderName ? `${founderName}'s FounderCycle` : "FounderCycle"}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <span
                  className={`inline-block size-2 rounded-full ${
                    allOk ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                WebMCP
              </Button>
            }
          />
          <DropdownMenuContent>
            {services.map((s) => (
              <DropdownMenuItem key={s.provider}>
                {s.label}: {s.ok ? `${s.latencyMs}ms` : "down"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={() => setModalOpen(true)}>
          <PlugIcon />
          Connect apps
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="sm">
          <UserIcon />
          Profile
        </Button>
      </div>

      <ConnectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        connections={connections}
        onSave={(c) => {
          setConnections(c);
          saveConnections(c);
        }}
      />
    </header>
  );
}
