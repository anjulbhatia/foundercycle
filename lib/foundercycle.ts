export const PROVIDERS = [
  { id: "gmail", label: "Gmail" },
  { id: "calendar", label: "Google Calendar" },
  { id: "notion", label: "Notion" },
  { id: "slack", label: "Slack" },
  { id: "github", label: "GitHub" },
] as const;

export type ProviderId = (typeof PROVIDERS)[number]["id"];

export const COLUMNS = [
  { id: "planned", label: "Planned" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];

export type CardType = "meeting" | "task" | "bug" | "idea" | "follow-up";

export interface KanbanCard {
  id: string;
  title: string;
  type: CardType;
  column: ColumnId;
  summary?: string;
}

/** App pipeline per card type: where the process travels. */
export const PIPELINES: Record<CardType, ProviderId[]> = {
  meeting: ["notion", "calendar", "gmail"],
  bug: ["github", "notion", "slack"],
  task: ["calendar", "gmail", "notion"],
  "follow-up": ["calendar", "gmail", "notion"],
  idea: ["notion", "github"],
};

/** Active stage index per column. Completed = all done. */
export const STAGE_INDEX: Record<ColumnId, number> = {
  planned: 0,
  ongoing: 1,
  completed: Number.MAX_SAFE_INTEGER,
};

export const NEXT_COLUMN: Record<ColumnId, ColumnId | null> = {
  planned: "ongoing",
  ongoing: "completed",
  completed: null,
};
