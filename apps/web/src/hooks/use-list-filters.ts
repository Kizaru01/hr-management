"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateListQuery, type ListQuery } from "@/lib/list-query";

export function useListFilters(
  committed: ListQuery,
  ownedKeys: readonly string[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(committed);
  const latest = useRef(committed);
  const pendingUrl = useRef<string | null>(null);
  // Server Components omit undefined properties: keys must come from the feature schema,
  // never from the values present on the first render.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialized = JSON.stringify(committed);
  const url = searchParams.toString();

  function cancelSearch() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(() => {
    // Sync server normalization and history navigation only after the latest transition.
    if (!isPending && !timer.current) {
      if (pendingUrl.current) {
        const currentUrl = pathname + (url ? "?" + url : "");
        if (currentUrl !== pendingUrl.current) return;
        pendingUrl.current = null;
      }
      const next: ListQuery = JSON.parse(serialized);
      latest.current = next;
      // URL state is external to React (including browser back/forward).
      setValues(next);
    }
  }, [serialized, url, pathname, isPending]);

  useEffect(() => {
    const onPopState = () => {
      cancelSearch();
      pendingUrl.current = null;
      const params = new URLSearchParams(window.location.search);
      const next = Object.fromEntries(
        ownedKeys.map((key) => [key, params.get(key) || undefined]),
      );
      latest.current = next;
      setValues(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      cancelSearch();
      window.removeEventListener("popstate", onPopState);
    };
  }, [ownedKeys]);

  function navigate(next: ListQuery) {
    const normalized = { ...next, q: next.q?.trim() || undefined };
    latest.current = normalized;
    setValues(normalized);
    // Read unrelated keys at commit time, while owned keys come from the latest draft.
    const params = updateListQuery(
      new URLSearchParams(window.location.search),
      {
        ...Object.fromEntries(ownedKeys.map((key) => [key, undefined])),
        ...normalized,
      },
    );
    const query = params.toString();
    pendingUrl.current = pathname + (query ? "?" + query : "");
    startTransition(() =>
      router.push(pathname + (query ? "?" + query : ""), { scroll: false }),
    );
  }

  function search(q: string) {
    cancelSearch();
    latest.current = { ...latest.current, q };
    setValues(latest.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      navigate(latest.current);
    }, 300);
  }

  function change(patch: ListQuery) {
    // Commit the draft search with the selection, cancelling its older timer.
    cancelSearch();
    navigate({ ...latest.current, ...patch });
  }

  function clear() {
    cancelSearch();
    navigate(Object.fromEntries(ownedKeys.map((key) => [key, undefined])));
  }

  return {
    values,
    search,
    change,
    clear,
    isPending,
    isSearching: values.q !== committed.q,
  };
}
