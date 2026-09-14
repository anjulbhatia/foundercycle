import { NextResponse } from "next/server";
import { getDb } from "foundercycle/db/client";

export async function GET() {
  const db = getDb();
  const row = db.prepare("SELECT id, name, context FROM profiles ORDER BY id DESC LIMIT 1").get() as
    | { id: number; name: string; context: string }
    | undefined;
  return NextResponse.json(row ?? null);
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; context?: string };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare("INSERT INTO profiles (name, context) VALUES (?, ?)").run(
    body.name.trim(),
    body.context ?? ""
  );
  return NextResponse.json({ ok: true });
}
