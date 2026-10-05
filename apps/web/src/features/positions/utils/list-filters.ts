import { positionQuerySchema } from "@hr-management/validation";
import type { ListSearchParams } from "@/lib/list-query";

export const positionQueryKeys = Object.keys(positionQuerySchema.shape);

export function normalizePositionQuery(raw: ListSearchParams) {
  return {
    q: positionQuerySchema.shape.q.safeParse(raw.q).data || undefined,
    status:
      positionQuerySchema.shape.status.safeParse(raw.status).data || undefined,
  };
}

export const positionFilters = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];
