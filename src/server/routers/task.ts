import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { taskIdSchema, taskInputSchema } from "@/lib/task-schema";
import { taskStore } from "../task-store";
import { publicProcedure, router } from "../trpc";

/**
 * I centralized the "task not found" error in one helper because every
 * procedure then answers a missing task with the same code (NOT_FOUND) and the
 * same message format.
 */
function notFound(id: number): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `Tarefa ${id} não encontrada.` });
}

export const taskRouter = router({
  /**
   * I named the pagination field `cursor` because it is tRPC's
   * infinite-query convention, so the client can use `useInfiniteQuery` with no
   * glue code. I capped `limit` at 50 so a single request cannot ask for everything.
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: taskIdSchema.nullish(),
      }),
    )
    .query(({ input }) => taskStore.list(input)),

  byId: publicProcedure
    .input(z.object({ id: taskIdSchema }))
    .query(({ input }) => taskStore.get(input.id) ?? notFound(input.id)),

  create: publicProcedure
    .input(taskInputSchema)
    .mutation(({ input }) => taskStore.create(input)),

  /**
   * I went with a partial update (only the fields that are sent change) because
   * API clients do not have to resend the whole task. The title keeps its
   * validation, so it can never be changed to an empty value.
   */
  update: publicProcedure
    .input(taskInputSchema.partial().extend({ id: taskIdSchema }))
    .mutation(({ input: { id, ...data } }) => taskStore.update(id, data) ?? notFound(id)),

  delete: publicProcedure
    .input(z.object({ id: taskIdSchema }))
    .mutation(({ input }) => {
      if (!taskStore.delete(input.id)) notFound(input.id);
      return { id: input.id };
    }),
});
