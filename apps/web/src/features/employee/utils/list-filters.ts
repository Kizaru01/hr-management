import { employeeQuerySchema } from "@hr-management/validation";
import type { ListSearchParams } from "@/lib/list-query";

export const employeeQueryKeys = Object.keys(employeeQuerySchema.shape);

export function normalizeEmployeeQuery(raw: ListSearchParams) {
  return {
    q: employeeQuerySchema.shape.q.safeParse(raw.q).data || undefined,
    departmentId:
      employeeQuerySchema.shape.departmentId.safeParse(raw.departmentId).data ||
      undefined,
    positionId:
      employeeQuerySchema.shape.positionId.safeParse(raw.positionId).data ||
      undefined,
    branchId:
      employeeQuerySchema.shape.branchId.safeParse(raw.branchId).data ||
      undefined,
    employmentStatus:
      employeeQuerySchema.shape.employmentStatus.safeParse(raw.employmentStatus)
        .data || undefined,
  };
}

export function employeeFilterControls(
  departments: { value: string; label: string }[],
  branches: { value: string; label: string }[],
  positions: { value: string; label: string }[],
  positionsReady: boolean,
) {
  return [
    { key: "departmentId", label: "Department", options: departments },
    {
      key: "positionId",
      label: "Position",
      options: positionsReady ? positions : [],
      disabled: !positionsReady,
    },
    { key: "branchId", label: "Branch", options: branches },
    {
      key: "employmentStatus",
      label: "Employment status",
      options: employeeQuerySchema.shape.employmentStatus
        .unwrap()
        .options.map((value) => ({
          value,
          label: value
            .replaceAll("_", " ")
            .replace(/^./, (letter) => letter.toUpperCase()),
        })),
    },
  ];
}
