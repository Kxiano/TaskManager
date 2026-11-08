import "server-only";
import { createCallerFactory } from "./trpc";
import { appRouter } from "./routers/_app";

/**
 * I made Server Components call the router directly for SSR (instead
 * of fetching our own /api/trpc over HTTP) because it skips a network
 * round-trip and still runs the same validation and middlewares as the API.
 * I imported "server-only" so the build fails if client code ever imports this file.
 */
export const serverCaller = createCallerFactory(appRouter)({});
