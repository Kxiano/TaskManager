import { TaskCardSkeletons } from "@/components/skeletons";
import { PAGE_SIZE } from "@/lib/task-schema";

/**
 * I made the list's loading screen mirror the real page (same
 * toolbar, one placeholder card per task of the first page) so nothing moves
 * when the content replaces it.
 */
export default function Loading() {
  return (
    <>
      <div className="toolbar">
        <h1>Tarefas</h1>
        <div className="skeleton skeleton-button skeleton-button-wide" />
      </div>
      <TaskCardSkeletons count={PAGE_SIZE} />
    </>
  );
}
