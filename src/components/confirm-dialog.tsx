"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * I built the modal on the native <dialog> element (opened with showModal())
 * instead of a UI library because the browser already provides what a modal
 * needs: focus trapping, closing with Esc, a backdrop, and the right
 * accessibility roles. Unlike window.confirm, it can be styled to match the app
 * and it does not freeze the page.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // <dialog> is opened and closed through its API, so I sync it with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="confirm-dialog-title"
      // Esc fires "cancel". I block it while the request runs, so the user
      // always sees how the action ended.
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onCancel();
      }}
      // A click on the dialog element itself (not its content) means the backdrop was clicked.
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{message}</p>
      <div className="form-actions">
        {/* I put the initial focus on "Cancelar" because, for a destructive action,
            pressing Enter by reflex should never delete anything. */}
        <button type="button" className="btn" onClick={onCancel} disabled={isPending} autoFocus>
          Cancelar
        </button>
        <button type="button" className="btn btn-danger-solid" onClick={onConfirm} disabled={isPending}>
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
