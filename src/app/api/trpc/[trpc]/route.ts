import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { ZodError } from "zod";
import { appRouter } from "@/server/routers/_app";

/**
 * I chose to serve tRPC through the fetch adapter in a Route Handler because
 * it is the native way to expose an API in the Next.js App Router, with no
 * custom server.
 */
function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    /*
     * I log every failed call because tRPC does not log errors by
     * default, and the server log should show what went wrong. Expected errors
     * (validation, not found) are logged as warnings; unexpected ones as errors
     * with the stack, so real bugs stand out.
     */
    onError({ path, error }) {
      const message = error.cause instanceof ZodError ? error.cause.issues[0]?.message : error.message;
      const line = `[tRPC] ${path ?? "<unknown>"} failed: ${error.code} - ${message}`;
      if (error.code === "INTERNAL_SERVER_ERROR") console.error(line, error.cause ?? error);
      else console.warn(line);
    },
  });
}

export { handler as GET, handler as POST };
