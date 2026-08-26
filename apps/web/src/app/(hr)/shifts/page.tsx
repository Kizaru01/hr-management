import { CreateShiftForm } from "@/features/shift/components/create-shift-form";
import { ShiftList } from "@/features/shift/components/shift-list";
import { getShifts } from "@/features/shift/server/get-shifts";

export default async function ShiftsPage() {
  const response = await getShifts();
  const activeCount = response.data.filter((shift) => shift.isActive).length;
  const shiftSummaries = response.data.map(
    ({ id, name, startTime, endTime, isActive }) => ({
      id,
      name,
      startTime,
      endTime,
      isActive,
    }),
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shift Management</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Configure work schedules and control which shifts can be assigned.
          </p>
        </div>

        <p className="w-fit shrink-0 rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-sm font-medium text-foreground/70">
          {activeCount} active of {response.data.length}
        </p>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(17rem,0.65fr)_minmax(0,1.35fr)]">
        <CreateShiftForm />

        <div className="min-w-0 space-y-3">
          <div>
            <h2 className="font-semibold">Configured shifts</h2>
            <p className="mt-1 text-sm text-foreground/60">
              Review, update, or deactivate existing schedules.
            </p>
          </div>
          <ShiftList shifts={shiftSummaries} />
        </div>
      </div>
    </section>
  );
}
