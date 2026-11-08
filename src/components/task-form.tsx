"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  taskInputSchema,
  type Task,
  type TaskInput,
} from "@/lib/task-schema";
import { trpc } from "@/trpc/client";

type FieldErrors = Partial<Record<keyof TaskInput, string>>;

/**
 * I validate the form with the same Zod schema the server uses
 * because the user gets instant feedback with no request, and the client and
 * server rules can never drift apart. The server still validates on its own.
 */
function validate(values: TaskInput) {
  const result = taskInputSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} as FieldErrors };

  const { fieldErrors } = z.flattenError(result.error);
  return {
    data: null,
    errors: { titulo: fieldErrors.titulo?.[0], descricao: fieldErrors.descricao?.[0] },
  };
}

/**
 * I went with one form for both creating and editing (pass `task` to edit)
 * because both have the same fields and rules, so there is a single place to change them.
 */
export function TaskForm({ task }: { task?: Task }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [values, setValues] = useState({
    titulo: task?.titulo ?? "",
    descricao: task?.descricao ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  // I chose to show errors only after the first submit and then live as the
  // user types, because flagging fields the user has not finished yet feels aggressive.
  const [submitted, setSubmitted] = useState(false);

  // The cached list is invalidated before navigating back, so the list
  // shows the change right away instead of the stale cached version.
  const goBackToList = async (status: "created" | "updated") => {
    await utils.task.list.invalidate();
    router.push(`/?status=${status}`);
  };
  const createTask = trpc.task.create.useMutation({ onSuccess: () => goBackToList("created") });
  const updateTask = trpc.task.update.useMutation({ onSuccess: () => goBackToList("updated") });
  const mutation = task ? updateTask : createTask;
  // I keep the button disabled after success too, until navigation
  // finishes, because it prevents double submits.
  const isBusy = mutation.isPending || mutation.isSuccess;

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next).errors);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    const { data, errors } = validate(values);
    setErrors(errors);
    if (!data) return;

    if (task) updateTask.mutate({ id: task.id, ...data });
    else createTask.mutate(data);
  }

  // I turned off the browser's built-in validation (noValidate) because
  // the form shows its own messages, the same ones the server returns.
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Backend errors appear above the form because they concern the
          whole action (e.g. the task was deleted in the meantime), not one field. */}
      {mutation.error && (
        <div className="alert alert-error" role="alert">
          {mutation.error.message}
        </div>
      )}

      <div className="field">
        <label htmlFor="titulo">Título *</label>
        <input
          id="titulo"
          name="titulo"
          value={values.titulo}
          onChange={handleChange}
          maxLength={TITLE_MAX}
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={errors.titulo ? "titulo-error" : undefined}
          autoFocus
        />
        {errors.titulo && (
          <span id="titulo-error" className="field-error">
            {errors.titulo}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          value={values.descricao}
          onChange={handleChange}
          maxLength={DESCRIPTION_MAX}
          aria-invalid={Boolean(errors.descricao)}
        />
        {errors.descricao && <span className="field-error">{errors.descricao}</span>}
      </div>

      <div className="form-actions">
        <Link href="/" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn-primary" disabled={isBusy}>
          {isBusy ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
