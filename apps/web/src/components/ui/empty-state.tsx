import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-border bg-surface px-6 py-10 text-center shadow-card">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-border bg-hover text-muted-foreground">
        <Inbox aria-hidden="true" size={18} />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
