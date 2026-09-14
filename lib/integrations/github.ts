import { mockLatency, type ToolResult } from "./types";

export async function getPullRequest(n: number): Promise<ToolResult> {
  await mockLatency();
  return {
    ok: true,
    step: `github.getPullRequest (stub): PR #${n} context pulled`,
    links: [`github://pr/${n}`],
  };
}

export async function createIssue(title: string): Promise<ToolResult> {
  await mockLatency();
  return {
    ok: true,
    step: `github.createIssue (stub): "${title}"`,
    links: ["github://issue/stub"],
  };
}
