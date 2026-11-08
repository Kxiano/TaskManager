import { TaskFormSkeleton } from "@/components/skeletons";

/**
 * I gave this route its own loading file because, without it,
 * Next.js falls back to the nearest parent one (the list skeleton in
 * app/loading.tsx), which does not match a form page.
 */
export default function Loading() {
  return (
    <>
      <h1>Nova tarefa</h1>
      <TaskFormSkeleton />
    </>
  );
}
