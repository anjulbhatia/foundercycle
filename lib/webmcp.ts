import { PROVIDERS } from "@/lib/foundercycle";

export interface ServiceStatus {
  provider: string;
  label: string;
  ok: boolean;
  latencyMs: number;
}

export async function fetchWebmcpStatus(): Promise<ServiceStatus[]> {
  try {
    const res = await fetch("/api/webmcp", { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    return (await res.json()) as ServiceStatus[];
  } catch {
    // fallback mock: all up, used before API ready
    return PROVIDERS.map((p) => ({
      provider: p.id,
      label: p.label,
      ok: true,
      latencyMs: Math.round(40 + Math.random() * 120),
    }));
  }
}
