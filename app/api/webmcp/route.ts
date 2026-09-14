import { NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/foundercycle";

export async function GET() {
  // v0 mock: report all services up. Replace with real WebMCP pings.
  const data = PROVIDERS.map((p) => ({
    provider: p.id,
    label: p.label,
    ok: true,
    latencyMs: Math.round(40 + Math.random() * 120),
  }));
  return NextResponse.json(data);
}
