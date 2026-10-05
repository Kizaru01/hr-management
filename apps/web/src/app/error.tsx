"use client";

export default function PageError({ reset }: { reset: () => void }) {
  return <section role="alert" className="m-6 rounded-card border border-destructive-border bg-destructive-surface p-5 text-foreground">
    <h2 className="font-semibold">Unable to load this page</h2>
    <p className="mt-2 text-sm">Please check your connection and try again.</p>
    <button type="button" onClick={reset} className="mt-4 rounded-control border border-border-strong px-4 py-2 font-medium">Retry</button>
  </section>;
}
