"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaginatedApiResponse } from "@/shared/types/api.types";

export const INFINITE_PAGE_SIZE = 25;

type Fetcher<T> = (
  page: number,
  pageSize: number
) => Promise<PaginatedApiResponse<T[] | null>>;

export function useInfiniteList<T>({
  fetcher,
  deps,
  pageSize = INFINITE_PAGE_SIZE,
  enabled = true,
}: {
  fetcher: Fetcher<T>;
  deps: unknown[];
  pageSize?: number;
  enabled?: boolean;
}) {
  const [items, setItems] = useState<T[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const depsKey = JSON.stringify(deps);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!enabled || loadingRef.current) return;
      loadingRef.current = true;
      if (append) setLoadingMore(true);
      else setItems(null);

      try {
        const res = await fetcherRef.current(pageNum, pageSize);
        const next = (res.data ?? []) as T[];
        setItems((prev) => (append ? [...(prev ?? []), ...next] : next));
        const totalPages = res.pagination?.totalPages ?? 1;
        setHasMore(pageNum < totalPages && next.length >= pageSize);
        setPage(pageNum);
      } finally {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    },
    [enabled, pageSize]
  );

  useEffect(() => {
    if (!enabled) return;
    setHasMore(true);
    setPage(1);
    void loadPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, enabled, pageSize]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || loadingMore) return;
    void loadPage(page + 1, true);
  }, [hasMore, loadingMore, loadPage, page]);

  return {
    data: items,
    hasMore,
    loadMore,
    loadingMore,
  };
}
