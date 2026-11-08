# Task Manager — Next.js 15 + tRPC

A simple task manager built for the practical part of the challenge.
Tasks are kept **in memory** on the server and exposed through **tRPC**.

## Running

Requires Node.js 18.18+.

```bash
npm install
npm run dev        # development: http://localhost:3000
# or
npm run build && npm start   # production
```

The app starts with 30 fictional sample tasks, so infinite scroll can be tried right away.
Because storage is in memory, all data is reset whenever the server restarts.

**Simulated latency:** in development every tRPC call waits 800 ms, so the loading states
(skeletons, "Salvando...") can be seen. Change it with `SIMULATED_DELAY_MS`
(e.g. `SIMULATED_DELAY_MS=0 npm run dev`). In production the default is 0.

## Stack

| Part        | Choice                                         |
| ----------- | ---------------------------------------------- |
| Framework   | Next.js 15 (App Router), React 19, TypeScript  |
| API         | tRPC v11 (fetch adapter in a Route Handler)    |
| Client data | `@trpc/react-query` + TanStack Query v5        |
| Validation  | Zod (one schema shared by client and server)   |

## How it works

```
src/
├── lib/task-schema.ts          # Task type + Zod schema shared by server and form
├── server/
│   ├── task-store.ts           # In-memory repository (singleton on globalThis)
│   ├── trpc.ts                 # tRPC init + error formatter
│   ├── routers/task.ts         # list / byId / create / update / delete
│   ├── routers/_app.ts         # Root router + AppRouter type
│   └── caller.ts               # Server-side caller used for SSR
├── trpc/                       # Typed React client + provider
├── hooks/use-infinite-scroll.ts
├── components/
│   ├── task-list.tsx           # List, delete with feedback, infinite scroll
│   ├── task-form.tsx           # Create/edit form with validation
│   ├── confirm-dialog.tsx      # Delete confirmation modal (<dialog>)
│   └── skeletons.tsx           # Loading placeholders (cards and form)
└── app/
    ├── api/trpc/[trpc]/route.ts  # HTTP endpoint for tRPC
    ├── page.tsx                  # "/" — list (SSR)
    ├── loading.tsx               # List skeleton
    ├── tasks/new/
    │   ├── page.tsx              # "/tasks/new" — create
    │   └── loading.tsx           # Form skeleton
    └── tasks/[id]/edit/
        ├── page.tsx              # "/tasks/:id/edit" — edit (SSR-loaded)
        └── loading.tsx           # Form skeleton
```

### Backend (tRPC)

A task has `id` (auto-generated), `titulo` (required), `descricao` (optional) and `dataCriacao` (timestamp in ms).

| Procedure     | Type     | Input                                  |
| ------------- | -------- | -------------------------------------- |
| `task.list`   | query    | `{ limit?, cursor? }` → `{ items, nextCursor }` |
| `task.byId`   | query    | `{ id }`                               |
| `task.create` | mutation | `{ titulo, descricao? }`               |
| `task.update` | mutation | `{ id, titulo?, descricao? }`          |
| `task.delete` | mutation | `{ id }`                               |

Errors:
- An empty or blank title → `BAD_REQUEST` with the message `"O título é obrigatório."`.
  The error formatter turns Zod's issue list into one readable message.
- Updating, reading or deleting a task that does not exist → `NOT_FOUND`.
- Every failed call is logged on the server, e.g. `[tRPC] task.update failed: NOT_FOUND - Tarefa 9999 não encontrada.`
  Expected errors are logged as warnings; unexpected ones (`INTERNAL_SERVER_ERROR`) as errors with the stack trace.

### Frontend

- **List (`/`)** — a Server Component loads the first page on the server with the tRPC server caller (SSR), with no HTTP call to our own API.
  That page is the `initialData` of a client `useInfiniteQuery`, which takes care of infinite scroll and refetching.
- **Skeletons** — shown on every load; see [UX during loading](#ux-during-loading-skeletons).
- **Delete** — done right in the list, after confirming in a modal. The modal shows "Excluindo..." while the request runs,
  then closes, and a success or error message appears.
- **Form** — one component for both creating and editing, built with `useState`. Client validation uses the **same Zod schema** as the server.
  The submit button is disabled while saving, and backend errors appear above the form.
  On success the app goes back to the list and shows a confirmation.

### UX during loading (skeletons)

Instead of a blank screen or a plain "Carregando..." text, the app shows **skeletons**:
grey placeholders with the same shape as the content that is about to appear, with a soft shine moving across them.

Why this improves the experience:
- **The user sees right away that something is happening.** The page answers the click instantly, even before the data arrives.
- **The wait feels shorter.** Showing the layout of what is coming makes loading feel faster than a spinner or a blank page.
- **No layout jumps.** The placeholders take the same space as the real cards and form, so nothing moves when the content replaces them.
  The card skeleton reuses the real card's tags and classes (with invisible text), so both share the same font sizes and spacing.
  It has exactly the height of a card whose title and description fit on one line. The list always shows the full text,
  so cards with longer content grow, because the content is unknown while it loads.

Where they appear:

| Moment                                  | Skeleton                      | File                                   |
| --------------------------------------- | ----------------------------- | -------------------------------------- |
| Opening the list (SSR)                  | One card per task of page 1   | `app/loading.tsx`                      |
| Infinite scroll fetching the next page  | 3 cards below the list        | `components/task-list.tsx`             |
| Opening the edit page (SSR)             | The form's fields and buttons | `app/tasks/[id]/edit/loading.tsx`      |
| Opening the create page                 | The same form skeleton        | `app/tasks/new/loading.tsx`            |

The page skeletons (list, create and edit) are Next.js `loading.tsx` files: Next shows them automatically (through React Suspense) while the server renders the page.
The infinite-scroll skeleton is shown by the list itself while `useInfiniteQuery` reports `isFetchingNextPage`.

Accessibility: the containers use `aria-busy` plus hidden "Carregando..." text for screen readers.
The animation turns off when the system asks for reduced motion (`prefers-reduced-motion`).

Other loading feedback follows the same idea: "Salvando..." on the form button, and "Excluindo..." with a faded card while a delete runs.
To see all of these states locally, use the simulated latency described in [Running](#running).

## Main decisions

Each decision below also appears as a comment next to the code it affects.

### Backend

- **In-memory `Map` as the store.** I went with a `Map` because the challenge asks for no database, and it gives fast lookups by id while keeping insertion order.
  *Tradeoff:* data is lost on every restart and is not shared between server instances.
- **Integer ids + cursor pagination.** I chose auto-incremented ids because they grow with creation time, so the id alone sorts the list (newest first) and works as the cursor (`id < cursor`).
  I preferred cursor over offset pagination because it does not skip or repeat tasks when some are deleted between page loads.
  *Tradeoff:* ids are predictable, which would matter for a public API with per-user permissions.
- **Store instance on `globalThis`.** Next.js can load server modules more than once (hot reload, separate bundles for the Route Handler and Server Components).
  I kept the store on `globalThis` so the API and the SSR pages always see the same list.
- **One Zod schema for client and server.** I shared a single schema between the tRPC input and the form, so both enforce the same rules with the same messages and can never drift apart.
- **Readable errors.** I replaced Zod's default error message (a JSON list of issues) with the first issue's text, so the UI can show it as-is ("O título é obrigatório.").
  Missing tasks always answer `NOT_FOUND`, and every failed call is logged on the server.
  *Tradeoff:* only the first validation issue reaches the message, which is enough for a two-field form.
- **Timestamp as a number.** I stored `dataCriacao` in milliseconds instead of a `Date` because it travels through JSON unchanged, so no serializer (superjson) is needed.

### SSR and data flow

- **Router called directly for SSR.** Server Components use a tRPC server caller instead of fetching `/api/trpc`.
  This skips an HTTP round-trip and still runs the same validation and middlewares.
- **`dynamic = "force-dynamic"` on pages that read data.** I forced dynamic rendering because the list changes at runtime. Otherwise Next.js would prerender it at build time and it would never change.
- **SSR page as the start of the client cache.** The first page rendered on the server becomes the `initialData` of `useInfiniteQuery`, and a 30 s `staleTime` stops the client from fetching it again right after hydration.
- **Refetch after changes.** After a create, update or delete I invalidate the list instead of editing the cache by hand, so it always matches the server.
  *Tradeoff:* one extra request per loaded page.

### Frontend and UX

- **IntersectionObserver for infinite scroll.** I picked an observer on a sentinel element over scroll events, because the browser reports when the end of the list is visible. No throttling, and no code runs on every scroll.
- **Confirmation modal on the native `<dialog>`.** I replaced `window.confirm` with a small modal built on `<dialog>` + `showModal()`.
  The browser provides focus trapping, Esc to close, the backdrop and accessibility roles, so no UI library is needed, and unlike
  `window.confirm` it matches the app's look and does not freeze the page. Focus starts on "Cancelar", so pressing Enter by reflex never deletes anything.
- **Skeletons built from the real card.** The card skeleton reuses the card's tags and classes with invisible text, so its size comes from the same fonts and spacing.
  *Tradeoff:* the list always shows the full text, so a skeleton matches cards whose text fits on one line, and longer cards are taller.
- **Simulated latency in development.** I added an 800 ms delay (development only, configurable) because the in-memory store answers instantly and the loading states would never be visible.

### Hydration safety

- **Dates built by hand.** I decided not to use `Intl.DateTimeFormat`, because its output varies with each engine's ICU data (Node vs. browsers), and the server and client texts must match.
  Dates use a fixed Brasília offset (UTC-3), since server and browser may be in different time zones.
  *Tradeoff:* users in other time zones also see Brasília time.
- **`suppressHydrationWarning` on `<html>`/`<body>` only.** Browser extensions add attributes to these tags before React hydrates. I limited the flag to these two tags because silencing the whole tree would also hide real mismatches.
  *Tradeoff:* extensions that mark every element (e.g. Bitdefender's `bis_skin_checked`) still show a warning in development.

### Tooling

- **TypeScript 5.** I pinned TypeScript 5 because Next.js 15 cannot load `next.config.ts` with TypeScript 7.
