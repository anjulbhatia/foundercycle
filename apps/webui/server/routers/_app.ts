import { router } from "@/server/trpc";
import { cardsRouter } from "@/server/routers/cards";
import { projectsRouter } from "@/server/routers/projects";

export const appRouter = router({
  cards: cardsRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
