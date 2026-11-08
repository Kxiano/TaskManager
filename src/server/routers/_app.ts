import { router } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = router({
  task: taskRouter,
});

/**
 * Sharing only the router's type with the client was intentional: it gives
 * end-to-end type safety with no code generation, and no server code ends up
 * in the browser bundle.
 */
export type AppRouter = typeof appRouter;
