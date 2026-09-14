import { mockLatency, type ToolResult } from "./types";

export async function listEvents(_date: string): Promise<ToolResult> {
  await mockLatency();
  return { ok: true, step: "calendar.listEvents (stub): no conflicts" };
}

export async function createEvent(title: string): Promise<ToolResult> {
  await mockLatency();
  return {
    ok: true,
    step: `calendar.createEvent (stub): "${title}" (no overwrite)`,
    links: ["calendar://event/stub"],
  };
}
