import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * I went with tRPC's React Query integration because it brings caching,
 * loading/error states and infinite queries out of the box, all typed from the router.
 */
export const trpc = createTRPCReact<AppRouter>();
