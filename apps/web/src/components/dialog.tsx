"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  id: string;
  title: string;
  description?: string;
  onRequestClose: () => void;
  children: ReactNode;
  initialFocusSelector?: string;
}

export function Dialog({
  id,
  title,
  description,
  onRequestClose,
  children,
  initialFocusSelector = "[data-dialog-initial-focus]",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  useEffect(() => {
    const dialog = dialogRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    if (dialog && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        dialog.querySelector<HTMLElement>(initialFocusSelector)?.focus();
      });
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [initialFocusSelector]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedInside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!clickedInside) {
      onRequestClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-container border border-border-strong bg-elevated p-0 text-foreground shadow-overlay backdrop:bg-overlay"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={titleId}>{title}</h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRequestClose}
          aria-label={`Close ${title.toLowerCase()}`}
          className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}
