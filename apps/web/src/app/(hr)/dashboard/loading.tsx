import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading dashboard"
      className="page-stack"
    >
      <p role="status" className="text-sm text-muted-foreground">
        Loading your HR overview…
      </p>
      <div
        aria-hidden="true"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-5">
            <div className="h-4 w-32 rounded bg-muted motion-safe:animate-pulse" />
            <div className="mt-4 h-8 w-16 rounded bg-muted motion-safe:animate-pulse" />
          </Card>
        ))}
      </div>
      <div aria-hidden="true" className="grid gap-4 xl:grid-cols-3">
        <Card className="h-80 bg-surface motion-safe:animate-pulse xl:col-span-2" />
        <Card className="h-64 bg-surface motion-safe:animate-pulse" />
      </div>
    </section>
  );
}
