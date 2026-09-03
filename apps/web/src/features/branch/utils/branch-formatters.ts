import type { Branch } from "../types/branch";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

export function formatBranchDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatBranchLocation(branch: Branch) {
  return [branch.address, branch.city, branch.province]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}
