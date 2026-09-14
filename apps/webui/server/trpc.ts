import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const cardType = z.enum(["meeting", "task", "bug", "idea", "follow-up"]);
export const columnId = z.enum(["planned", "ongoing", "completed"]);
