import { NextResponse } from "next/server";
import { getDb } from "@/db/client";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, title, type, status, priority, summary FROM cards ORDER BY priority DESC, id DESC")
    .all();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title?: string;
    type?: string;
    status?: string;
  };
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const db = getDb();
  const res = db
    .prepare("INSERT INTO cards (title, type, status) VALUES (?, ?, ?)")
    .run(body.title.trim(), body.type ?? "task", body.status ?? "planned");
  return NextResponse.json({ ok: true, id: Number(res.lastInsertRowid) });
}
