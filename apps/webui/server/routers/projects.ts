import { z } from "zod";
import {
  archiveProject,
  createProject,
  listProjects,
  renameProject,
} from "foundercycle/db/client";
import { publicProcedure, router } from "@/server/trpc";

export const projectsRouter = router({
  list: publicProcedure.query(() => listProjects()),
  create: publicProcedure
    .input(z.object({ name: z.string().trim().min(1).max(120) }))
    .mutation(({ input }) => ({ id: createProject(input.name) })),
  rename: publicProcedure
    .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(1).max(120) }))
    .mutation(({ input }) => {
      renameProject(input.id, input.name);
      return { ok: true };
    }),
  archive: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => {
      archiveProject(input.id, true);
      return { ok: true };
    }),
});
