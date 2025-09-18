"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUrlParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else if (value.trim && value.trim()) {
          params.set(key, value);
        } else if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return {
    params: searchParams,
    updateParams,
    setSearch: useCallback(
      (query: string) => {
        updateParams({ search: query || null, page: null });
      },
      [updateParams]
    ),
    setFilter: useCallback(
      (status: string) => {
        updateParams({ status: status || null, page: null });
      },
      [updateParams]
    ),
    setSort: useCallback(
      (field: string, currentSort?: string) => {
        let newSort = field;
        if (currentSort === field) {
          newSort = `-${field}`;
        } else if (currentSort === `-${field}`) {
          updateParams({ sort: null });
          return;
        }
        updateParams({ sort: newSort });
      },
      [updateParams]
    ),
    setPage: useCallback(
      (page: number) => {
        updateParams({ page: page.toString() });
      },
      [updateParams]
    ),
  };
}
