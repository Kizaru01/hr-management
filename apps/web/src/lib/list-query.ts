export type ListSearchParams = Record<string, string | string[] | undefined>;
export type ListQuery = Record<string, string | undefined>;

export function queryString(values: ListQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? "?" + query : "";
}

// Only owned keys are replaced; other features' parameters survive navigation.
export function updateListQuery(params: URLSearchParams, values: ListQuery) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  for (const key of ["page", "cursor", "offset"]) next.delete(key);
  return next;
}
