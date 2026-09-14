import { NextResponse } from "next/server";
import { processNext } from "foundercycle/agent/run";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { approved?: boolean };
  const result = await processNext(body.approved === true);
  return NextResponse.json(result);
}
