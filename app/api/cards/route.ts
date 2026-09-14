import { NextResponse } from "next/server";
import { createCard, getDb, updateCard } from "@/db/client";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, title, type, status, priority, summary, links_json, approval_flag, created_at FROM cards ORDER BY priority DESC, id DESC"
    )
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
  const id = createCard(body.title.trim(), body.type ?? "task", body.status ?? "planned");
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id?: number;
    type?: string;
    status?: string;
    summary?: string;
    priority?: number;
    approval_flag?: number;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  updateCard(body.id, {
    type: body.type,
    status: body.status,
    summary: body.summary,
  });
  if (body.priority !== undefined || body.approval_flag !== undefined) {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (body.priority !== undefined) {
      sets.push("priority = ?");
      params.push(body.priority);
    }
    if (body.approval_flag !== undefined) {
      sets.push("approval_flag = ?");
      params.push(body.approval_flag);
    }
    params.push(body.id);
    getDb().prepare(`UPDATE cards SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  }
  return NextResponse.json({ ok: true });
}
