import { TaskFormSkeleton } from "@/components/skeletons";

/**
 * I show the form skeleton while the task loads on the server so the
 * page reacts to the click right away instead of waiting on the old screen.
 */
export default function Loading() {
  return (
    <>
      <h1>Editar tarefa</h1>
      <TaskFormSkeleton />
    </>
  );
}
