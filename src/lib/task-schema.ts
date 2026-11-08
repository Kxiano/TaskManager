import { z } from "zod";

/**
 * I kept a single Zod schema shared by the server (tRPC input) and the
 * form (client-side validation) because both sides then enforce the same rules
 * with the same messages, and they can never drift apart.
 */
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 500;

export const taskInputSchema = z.object({
  titulo: z
    // Both `error` and `.min(1)` are set because a missing title and an
    // empty one are different Zod failures, and both should show the same message.
    .string({ error: "O título é obrigatório." })
    .trim()
    .min(1, "O título é obrigatório.")
    .max(TITLE_MAX, `O título deve ter no máximo ${TITLE_MAX} caracteres.`),
  descricao: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `A descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`)
    .optional(),
});

export const taskIdSchema = z.number().int().positive();

export type TaskInput = z.infer<typeof taskInputSchema>;

export type Task = {
  id: number;
  titulo: string;
  descricao?: string;
  /**
   * I chose to store dataCriacao as a number (ms timestamp) instead of a Date
   * because it travels through JSON unchanged, so no serializer such as
   * superjson is needed. Tradeoff: the UI formats it itself (see format-date.ts).
   */
  dataCriacao: number;
};

/**
 * I settled on 10 tasks per page because it fills the screen on first load
 * while keeping each request small. It is shared by the SSR first page and the
 * infinite scroll, so both always ask for pages of the same size.
 */
export const PAGE_SIZE = 10;
