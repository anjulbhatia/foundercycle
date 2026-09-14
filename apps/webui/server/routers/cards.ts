import { z } from "zod";
import { createCard, getDb } from "foundercycle/db/client";
import { columnId, cardType, publicProcedure, router } from "@/server/trpc";

export const cardsRouter = router({
  listByProject: publicProcedure
    .input(z.object({ projectId: z.number().int().positive() }))
    .query(({ input }) =>
      getDb()
        .prepare(
          "SELECT id, title, type, status, priority, summary, links_json, approval_flag, created_at FROM cards WHERE project_id = ? ORDER BY priority DESC, id DESC"
        )
        .all(input.projectId)
    ),
  create: publicProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(2000),
        type: cardType.default("task"),
        status: columnId.default("planned"),
        projectId: z.number().int().positive().default(1),
      })
    )
    .mutation(({ input }) => ({
      id: createCard(input.title, input.type, input.status, input.projectId),
    })),
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        type: cardType.optional(),
        status: columnId.optional(),
        summary: z.string().max(2000).optional(),
      })
    )
    .mutation(({ input }) => {
      const sets: string[] = [];
      const params: unknown[] = [];
      if (input.type !== undefined) {
        sets.push("type = ?");
        params.push(input.type);
      }
      if (input.status !== undefined) {
        sets.push("status = ?");
        params.push(input.status);
      }
      if (input.summary !== undefined) {
        sets.push("summary = ?");
        params.push(input.summary);
      }
      if (sets.length > 0) {
        params.push(input.id);
        getDb().prepare(`UPDATE cards SET ${sets.join(", ")} WHERE id = ?`).run(...params);
      }
      return { ok: true };
    }),
});
