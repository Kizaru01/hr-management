import { ShiftManagement } from "@/features/shift/components/shift-management";
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
    <ShiftManagement shifts={shiftSummaries} activeCount={activeCount} />
  );
}
