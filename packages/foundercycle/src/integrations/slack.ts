import { mockLatency, type ToolResult } from "./types";

export async function postMessage(channel: string, text: string): Promise<ToolResult> {
  await mockLatency();
  return {
    ok: true,
    step: `slack.postMessage (stub): #${channel} "${text.slice(0, 60)}"`,
  };
}
