import type { CardType } from "@/lib/foundercycle";
import type { RunContext, ToolResult } from "@/lib/integrations/types";
import * as gmail from "@/lib/integrations/gmail";
import * as calendar from "@/lib/integrations/calendar";
import * as notion from "@/lib/integrations/notion";
import * as github from "@/lib/integrations/github";
import * as slack from "@/lib/integrations/slack";

export interface FlowOutcome {
  summary: string;
  links: string[];
  /** Column to move the card to when done. */
  nextStatus: "ongoing" | "completed";
}

function collect(results: ToolResult[]): { links: string[]; failed: boolean } {
  return {
    links: results.flatMap((r) => r.links ?? []),
    failed: results.some((r) => !r.ok && !r.step.includes("BLOCKED")),
  };
}

const flows: Record<CardType, (title: string, ctx: RunContext) => Promise<FlowOutcome>> = {
  async meeting(title, ctx) {
    const contact = await notion.findContact(title);
    const conflicts = await calendar.listEvents(title);
    const event = await calendar.createEvent(title);
    const draft = await gmail.draft(title);
    const results = [contact, conflicts, event, draft];
    const { links } = collect(results);
    return {
      links,
      nextStatus: "ongoing",
      summary: `Meeting queued: contact lookup + conflict check + event + draft. ${draft.step}`,
    };
  },

  async bug(title, ctx) {
    const pr = title.match(/#(\d+)/);
    const context = pr
      ? await github.getPullRequest(Number(pr[1]))
      : { ok: true as const, step: "github: no PR number in title, skipped" };
    const note = await notion.createPage(title, "Engineering");
    const ping = await slack.postMessage("eng", `Triaged: ${title}`);
    const { links } = collect([context, note, ping]);
    return {
      links,
      nextStatus: "ongoing",
      summary: `Bug triaged: PR context + Notion note + Slack ping.`,
    };
  },

  async task(title, ctx) {
    const deadline = await calendar.createEvent(`Deadline: ${title}`);
    const draft = await gmail.draft(title);
    const log = await notion.append("Actions", title);
    const { links } = collect([deadline, draft, log]);
    return {
      links,
      nextStatus: "ongoing",
      summary: `Task queued: deadline + draft + action log.`,
    };
  },

  async "follow-up"(title, ctx) {
    const draft = await gmail.draft(title);
    const log = await notion.append("Actions", title);
    const { links } = collect([draft, log]);
    return {
      links,
      nextStatus: "ongoing",
      summary: `Follow-up drafted + logged. Send needs approval.`,
    };
  },

  async idea(title, ctx) {
    const page = await notion.createPage(title, "Ideas");
    const { links } = collect([page]);
    return {
      links,
      nextStatus: "completed",
      summary: `Idea filed in Notion under Ideas.`,
    };
  },
};

export function runFlow(type: CardType, title: string, ctx: RunContext): Promise<FlowOutcome> {
  return flows[type](title, ctx);
}
