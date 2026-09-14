import { mockLatency, type ToolResult } from "./types";

export async function findContact(name: string): Promise<ToolResult> {
  await mockLatency();
  return { ok: true, step: `notion.findContact (stub): "${name}" not in cache` };
}

export async function createPage(title: string, section = "Inbox"): Promise<ToolResult> {
  await mockLatency();
  return {
    ok: true,
    step: `notion.createPage (stub): "${title}" under ${section}`,
    links: ["notion://page/stub"],
  };
}

export async function append(_page: string, text: string): Promise<ToolResult> {
  await mockLatency();
  return { ok: true, step: `notion.append (stub): logged "${text.slice(0, 60)}"` };
}
