import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

const t = initTRPC.create({
  /**
   * I replaced Zod's default error message (a JSON-encoded list of
   * issues) with the first issue's text because the frontend can then show it
   * as-is, e.g. "O título é obrigatório.". Tradeoff: only the first issue reaches
   * the message, which is enough for a two-field form that also validates on the client.
   */
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;
    return {
      ...shape,
      message: zodError?.issues[0]?.message ?? shape.message,
    };
  },
});

/**
 * I added simulated latency because the in-memory store answers
 * instantly, so the loading states (skeletons, "Salvando...") would never be
 * visible. I made it a middleware so it also delays the SSR caller, and the
 * page-level skeletons show up too. It defaults to 800 ms only in development
 * (0 in production) and can be changed with SIMULATED_DELAY_MS.
 * Tradeoff: development feels slower on purpose.
 */
const SIMULATED_DELAY_MS = Number(
  process.env.SIMULATED_DELAY_MS ?? (process.env.NODE_ENV === "development" ? 800 : 0),
);

const simulatedLatency = t.middleware(async ({ next }) => {
  if (SIMULATED_DELAY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  }
  return next();
});

export const router = t.router;
export const publicProcedure = t.procedure.use(simulatedLatency);
export const createCallerFactory = t.createCallerFactory;
