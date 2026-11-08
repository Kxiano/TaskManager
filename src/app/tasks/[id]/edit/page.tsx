import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { serverCaller } from "@/server/caller";

// I opted to render on every request (like the list page) because the task can change at any time.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTaskPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  // I load the task on the server so the form opens already filled
  // in. A missing task shows the 404 page instead of an empty form.
  const task = await serverCaller.task.byId({ id }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <>
      <h1>Editar tarefa</h1>
      <TaskForm task={task} />
    </>
  );
}
