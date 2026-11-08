import "server-only";
import type { Task, TaskInput } from "@/lib/task-schema";
import { SEED_TASKS } from "./seed-tasks";

/**
 * I decided to keep tasks in an in-memory Map because the challenge asks for no
 * database, and a Map gives fast lookups by id while keeping insertion order.
 * Tradeoff: data is lost on every restart and is not shared between server instances.
 *
 * I chose auto-incremented integer ids because they grow with creation
 * time, so the id alone sorts the list (newest first) and works as the
 * pagination cursor ("ids lower than the cursor"). I preferred cursor over offset
 * pagination because it does not skip or repeat tasks when some are deleted
 * between page loads. Tradeoff: ids are predictable, which would matter for a
 * public API with per-user permissions.
 */
class TaskStore {
  private tasks = new Map<number, Task>();
  private nextId = 1;

  list({ limit, cursor }: { limit: number; cursor?: number | null }) {
    const sorted = [...this.tasks.values()].reverse();
    const start = cursor ? sorted.filter((t) => t.id < cursor) : sorted;

    const items = start.slice(0, limit);
    const hasMore = start.length > limit;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  get(id: number) {
    return this.tasks.get(id);
  }

  create(input: TaskInput, dataCriacao = Date.now()): Task {
    const task: Task = {
      id: this.nextId++,
      titulo: input.titulo,
      // An empty description is stored as undefined so the app has a
      // single "no description" case to handle.
      descricao: input.descricao || undefined,
      dataCriacao,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /*
   * I made update/delete return undefined/false for a missing task
   * instead of throwing, because that keeps the store free of HTTP/tRPC concerns.
   * The router is the one that turns it into a NOT_FOUND error.
   */
  update(id: number, input: Partial<TaskInput>): Task | undefined {
    const current = this.tasks.get(id);
    if (!current) return undefined;

    const updated: Task = {
      ...current,
      titulo: input.titulo ?? current.titulo,
      descricao: input.descricao !== undefined ? input.descricao || undefined : current.descricao,
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: number) {
    return this.tasks.delete(id);
  }
}

/**
 * I seed fictional tasks because an empty list on first run would
 * hide the infinite scroll. I spaced them one hour apart so the creation dates
 * look like a real recent history.
 */
function seed(store: TaskStore) {
  const now = Date.now();
  const HOUR = 60 * 60_000;
  SEED_TASKS.forEach((task, i) => {
    store.create(task, now - (SEED_TASKS.length - 1 - i) * HOUR);
  });
}

/**
 * I opted to keep the store instance on globalThis because Next.js can load
 * this module more than once (hot reload in development, and separate bundles
 * for the API route and Server Components). Without it, the API and the SSR
 * pages could each see a different list. Tradeoff: a global variable, which is
 * acceptable here because it is the app's only shared state.
 */
const globalForStore = globalThis as unknown as { taskStore?: TaskStore };

export const taskStore =
  globalForStore.taskStore ??
  (() => {
    const store = new TaskStore();
    seed(store);
    return store;
  })();

globalForStore.taskStore = taskStore;
