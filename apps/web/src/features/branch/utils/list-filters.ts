import { branchQuerySchema } from "@hr-management/validation";
import type { ListSearchParams } from "@/lib/list-query";

export const branchQueryKeys = Object.keys(branchQuerySchema.shape);

export function normalizeBranchQuery(raw: ListSearchParams) {
  return {
    q: branchQuerySchema.shape.q.safeParse(raw.q).data || undefined,
    status:
      branchQuerySchema.shape.status.safeParse(raw.status).data || undefined,
  };
}

export const branchFilters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];
