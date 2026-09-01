"use client";

import type { KeyboardEvent, MouseEvent, ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { X } from "lucide-react";

interface SheetProps {
  id: string;
  title: string;
  description: string;
  dialogRef: RefObject<HTMLDialogElement | null>;
  onRequestClose: () => void;
  onAfterClose: () => void;
  children: ReactNode;
  autoFocusClose?: boolean;
  bodyClassName?: string;
}

export function Sheet({
  id,
  title,
  description,
  dialogRef,
  onRequestClose,
  onAfterClose,
  children,
  autoFocusClose = false,
  bodyClassName = "px-5 py-5 sm:px-6",
}: SheetProps) {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedInsideSheet =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!clickedInsideSheet) {
      onRequestClose();
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onRequestClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={handleDialogClick}
      onKeyDown={handleDialogKeyDown}
      onClose={onAfterClose}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[30rem] border-0 border-l border-border-strong bg-elevated p-0 text-foreground shadow-overlay backdrop:bg-overlay open:flex open:flex-col"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <button
          type="button"
          data-sheet-initial-focus={autoFocusClose ? "" : undefined}
          aria-label={`Close ${title.toLowerCase()}`}
          onClick={onRequestClose}
          className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-control text-muted-foreground transition hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </header>

      <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>
        {children}
      </div>
    </dialog>
  );
}

export function useSheetController<T>() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const [content, setContent] = useState<T | null>(null);

  const openSheet = (nextContent: T, trigger: HTMLElement) => {
    setContent(nextContent);
    lastTriggerRef.current = trigger;

    requestAnimationFrame(() => {
      if (!dialogRef.current?.open) {
        dialogRef.current?.showModal();
      }

      dialogRef.current
        ?.querySelector<HTMLElement>("[data-sheet-initial-focus]")
        ?.focus();
    });
  };

  const replaceContent = (nextContent: T) => {
    setContent(nextContent);

    requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("[data-sheet-initial-focus]")
        ?.focus();
    });
  };

  const requestClose = () => {
    dialogRef.current?.close();
  };

  const afterClose = () => {
    setContent(null);

    requestAnimationFrame(() => {
      lastTriggerRef.current?.focus({ preventScroll: true });
    });
  };

  return {
    dialogRef,
    content,
    openSheet,
    replaceContent,
    requestClose,
    afterClose,
  };
}
