import { departmentQuerySchema } from "@hr-management/validation";
import type { ListSearchParams } from "@/lib/list-query";

export const departmentQueryKeys = Object.keys(departmentQuerySchema.shape);

export function normalizeDepartmentQuery(raw: ListSearchParams) {
  return {
    q: departmentQuerySchema.shape.q.safeParse(raw.q).data || undefined,
    status:
      departmentQuerySchema.shape.status.safeParse(raw.status).data ||
      undefined,
  };
}

export const departmentFilters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];
