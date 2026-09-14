import { getDb } from "../db/client";
import type { ProviderId } from "../types";

export interface ServiceStatus {
  provider: ProviderId;
  ok: boolean;
  latencyMs: number;
  detail: string;
}

/**
 * WebMCP service registry. Status comes from real sqlite connection rows.
 * Latency is the measured time of the status read itself.
 */
export function getServiceStatus(): ServiceStatus[] {
  const t0 = Date.now();
  const db = getDb();
  const rows = db
    .prepare("SELECT provider, status FROM connections")
    .all() as { provider: string; status: string }[];
  const latencyMs = Math.max(1, Date.now() - t0);
  return rows.map((r) => ({
    provider: r.provider as ProviderId,
    ok: r.status === "connected",
    latencyMs,
    detail: r.status === "connected" ? "connected" : "disconnected",
  }));
}

export function isConnected(provider: ProviderId): boolean {
  const row = getDb()
    .prepare("SELECT status FROM connections WHERE provider = ?")
    .get(provider) as { status: string } | undefined;
  return row?.status === "connected";
}
