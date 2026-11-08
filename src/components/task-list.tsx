"use client";

import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TaskCardSkeletons } from "@/components/skeletons";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatDate } from "@/lib/format-date";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";

type ListPage = inferRouterOutputs<AppRouter>["task"]["list"];
type Notice = { type: "success" | "error"; text: string };

/**
 * I pass the form's success message through the URL
 * (/?status=created|updated) because the form navigates back to this page
 * anyway, and this needs no global state or context.
 */
const STATUS_MESSAGES: Record<string, string> = {
  created: "Tarefa criada com sucesso.",
  updated: "Tarefa atualizada com sucesso.",
};

type Props = { initialPage: ListPage; pageSize: number; status?: string };

export function TaskList({ initialPage, pageSize, status }: Props) {
  const utils = trpc.useUtils();
  const [notice, setNotice] = useState<Notice | null>(() =>
    status && STATUS_MESSAGES[status] ? { type: "success", text: STATUS_MESSAGES[status] } : null,
  );

  // Using the SSR page as `initialData` of an infinite query means the
  // client cache then starts from the server's data, and the next pages come from
  // the same query as the user scrolls.
  const list = trpc.task.list.useInfiniteQuery(
    { limit: pageSize },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: { pages: [initialPage], pageParams: [null] },
    },
  );

  // A delete cannot be undone, so I ask for confirmation in a modal first.
  // This holds the task waiting for confirmation (null = modal closed).
  const [taskToDelete, setTaskToDelete] = useState<{ id: number; titulo: string } | null>(null);

  // I preferred to refetch the list after a delete instead of removing the item
  // locally because the list then always matches the server, page boundaries
  // included. Tradeoff: one extra request per loaded page.
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      setNotice({ type: "success", text: "Tarefa excluída com sucesso." });
      return utils.task.list.invalidate();
    },
    onError: (error) => setNotice({ type: "error", text: error.message }),
    // The modal closes only once the list is up to date (or the delete failed),
    // so "Excluindo..." stays visible for the whole operation.
    onSettled: () => setTaskToDelete(null),
  });

  // ?status is removed from the URL once read, so reloading the page
  // does not show the same message again.
  useEffect(() => {
    if (status) window.history.replaceState(null, "", "/");
  }, [status]);

  // Notices hide after 4 seconds because they only confirm an
  // action and should not stay on screen.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    () => list.fetchNextPage(),
    list.hasNextPage && !list.isFetchingNextPage && !list.isError,
  );

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <div className="toolbar">
        <h1>Tarefas</h1>
        <Link href="/tasks/new" className="btn btn-primary">
          + Nova tarefa
        </Link>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="muted">Nenhuma tarefa cadastrada.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => {
            const isDeleting = deleteTask.isPending && deleteTask.variables?.id === task.id;
            return (
              <li key={task.id} className="task" style={{ opacity: isDeleting ? 0.5 : 1 }}>
                <div className="task-content">
                  <h2>{task.titulo}</h2>
                  {/* I show "Sem descrição" instead of leaving the line out,
                      so cards without a description keep the skeleton's height. */}
                  <p className={task.descricao ? undefined : "task-empty"}>
                    {task.descricao ?? "Sem descrição"}
                  </p>
                  <small>Criada em {formatDate(task.dataCriacao)}</small>
                </div>
                <div className="task-actions">
                  <Link href={`/tasks/${task.id}/edit`} className="btn">
                    Editar
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => setTaskToDelete({ id: task.id, titulo: task.titulo })}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* I opted for skeleton cards while the next page loads (instead of a
          text) so the new items appear in the same place and shape. */}
      <div ref={sentinelRef} />
      {list.isFetchingNextPage && (
        <div style={{ marginTop: "0.75rem" }}>
          <TaskCardSkeletons count={3} />
        </div>
      )}
      {list.isError && (
        <div className="alert alert-error" role="alert">
          Erro ao carregar tarefas: {list.error.message}{" "}
          <button className="btn" onClick={() => list.fetchNextPage()}>
            Tentar novamente
          </button>
        </div>
      )}
      {!list.hasNextPage && tasks.length > 0 && <p className="muted">Não há mais tarefas.</p>}

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Excluir tarefa"
        message={
          <>
            Tem certeza que deseja excluir <strong>{taskToDelete?.titulo}</strong>? Essa ação não pode
            ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        pendingLabel="Excluindo..."
        isPending={deleteTask.isPending}
        onConfirm={() => taskToDelete && deleteTask.mutate({ id: taskToDelete.id })}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
}
