import { redirect } from "next/navigation";
import {
  updateListQuery,
  type ListQuery,
  type ListSearchParams,
} from "./list-query";

export function normalizeListUrl(
  pathname: string,
  raw: ListSearchParams,
  values: ListQuery,
) {
  if (
    !Object.entries(values).some(
      ([key, value]) => raw[key] !== (value || undefined),
    )
  )
    return;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    for (const item of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value])
      params.append(key, item);
  }
  const query = updateListQuery(params, values).toString();
  redirect(query ? pathname + "?" + query : pathname);
}
