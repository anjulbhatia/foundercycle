import { getDb } from "@/db/client";
import type { ProviderId } from "@/lib/foundercycle";

export interface ServiceStatus {
  provider: ProviderId;
  ok: boolean;
  latencyMs: number;
  detail: string;
}

/**
 * WebMCP service registry. v0 reads sqlite connection rows and reports
 * stub latency. Real health checks plug in here per provider.
 */
export function getServiceStatus(): ServiceStatus[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT provider, status FROM connections")
    .all() as { provider: string; status: string }[];
  return rows.map((r) => ({
    provider: r.provider as ProviderId,
    ok: r.status === "connected",
    latencyMs: Math.round(40 + Math.random() * 120),
    detail: r.status === "connected" ? "stub: reachable" : "disconnected",
  }));
}

export function isConnected(provider: ProviderId): boolean {
  const row = getDb()
    .prepare("SELECT status FROM connections WHERE provider = ?")
    .get(provider) as { status: string } | undefined;
  return row?.status === "connected";
}
