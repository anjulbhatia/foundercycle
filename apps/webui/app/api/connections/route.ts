import { NextResponse } from "next/server";
import { getDb } from "foundercycle/db/client";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT provider, status FROM connections ORDER BY provider")
    .all();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = (await req.json()) as { provider?: string; status?: string };
  if (!body.provider) {
    return NextResponse.json({ error: "provider required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare(
    "INSERT INTO connections (provider, status, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(provider) DO UPDATE SET status=excluded.status, updated_at=datetime('now')"
  ).run(body.provider, body.status ?? "connected");
  return NextResponse.json({ ok: true });
}
