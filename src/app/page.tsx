import { TaskList } from "@/components/task-list";
import { PAGE_SIZE } from "@/lib/task-schema";
import { serverCaller } from "@/server/caller";

/**
 * I chose to force dynamic rendering because the list lives in memory and
 * changes at runtime. Otherwise Next.js would prerender this page at build time
 * and always show the same list.
 */
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function HomePage({ searchParams }: Props) {
  // I load the first page on the server (SSR) so that the HTML
  // arrives with the tasks already in it: no loading flash and no extra request
  // on first load. The client component takes over for infinite scroll and deletes.
  const [initialPage, { status }] = await Promise.all([
    serverCaller.task.list({ limit: PAGE_SIZE }),
    searchParams,
  ]);

  return <TaskList initialPage={initialPage} pageSize={PAGE_SIZE} status={status} />;
}
