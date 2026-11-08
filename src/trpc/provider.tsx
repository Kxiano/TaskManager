"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // Both clients are created inside useState so they are built once per
  // browser session; creating them in the render body would reset the cache on every render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // I set a 30 s staleTime because with the default (0) the client
          // would refetch the list it had just received from SSR, right after hydration.
          queries: { staleTime: 30_000 },
        },
      }),
  );
  // I picked httpBatchLink because calls made at the same time travel in a
  // single HTTP request.
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc" })] }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
