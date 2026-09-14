import {
  createRun,
  getLatestProfile,
  getNextCard,
  updateCard,
} from "@/db/client";
import { classify, REVIEW_THRESHOLD } from "@/lib/agent/classify";
import { runFlow } from "@/lib/agent/flows";

export interface ProcessResult {
  ran: boolean;
  cardId?: number;
  type?: string;
  summary?: string;
  reason?: string;
}

/**
 * Core loop, one card: read next → classify → act → write back → move.
 * Low confidence → card stays, review note written, nothing external sent.
 */
export async function processNext(approved = false): Promise<ProcessResult> {
  const card = getNextCard();
  if (!card) return { ran: false, reason: "no open cards" };

  const c = classify(card.title);
  const profile = getLatestProfile();

  if (c.confidence < REVIEW_THRESHOLD) {
    const summary = `Needs review (${c.type}, ${(c.confidence * 100).toFixed(0)}%): ${c.reason}. Left in place.`;
    updateCard(card.id, { type: c.type, summary });
    createRun(card.id, [`classify: ${c.reason}`], summary);
    return { ran: true, cardId: card.id, type: c.type, summary };
  }

  const outcome = await runFlow(c.type, card.title, {
    cardId: card.id,
    cardTitle: card.title,
    approved: approved || card.approval_flag === 1,
    profileName: profile?.name ?? "",
  });

  updateCard(card.id, {
    type: c.type,
    status: outcome.nextStatus,
    summary: outcome.summary,
    links: outcome.links,
  });
  createRun(card.id, [`classify: ${c.type} (${c.reason})`, ...outcome.links.map((l) => `link: ${l}`)], outcome.summary);

  return { ran: true, cardId: card.id, type: c.type, summary: outcome.summary };
}
