"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readDirectoryFilters, updateDirectoryFilters } from "@/lib/directory-filters";

const changed = "agro-directory-filters";
function subscribe(notify: () => void) {
  window.addEventListener("popstate", notify);
  window.addEventListener(changed, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(changed, notify);
  };
}
const snapshot = () => window.location.search;

/** Replace, rather than push, while typing: Back returns to the previous page. */
export function useDirectoryFilters<T extends Record<string, string>>(defaults: T, serverSearch = "") {
  const search = useSyncExternalStore(subscribe, snapshot, () => serverSearch);
  const filters = readDirectoryFilters(search, defaults);
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("ejemplo");
      sessionStorage.setItem(`agro-directory-return:${url.pathname}`, `${url.pathname}${url.search}`);
    } catch { /* Search and browser Back still work when storage is unavailable. */ }
  }, [search]);
  function changeFilters(changes: Partial<T>) {
    const next = updateDirectoryFilters(window.location.href, defaults, changes);
    window.history.replaceState(window.history.state, "", next);
    window.dispatchEvent(new Event(changed));
  }
  return [filters, changeFilters] as const;
}
