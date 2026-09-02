"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { MusicianFiltersState } from "@/types";
import { DEFAULT_FILTERS, fetchMusicians } from "@/lib";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import MusicianFilters from "./MusicianFilters";
import MusiciansList from "./MusiciansList";

function MusicianSearchPage() {
  const navigate = useNavigate({ from: "/" });
  const queryParams: MusicianFiltersState = useSearch({ from: "/" });

  const debouncedSearch = useDebouncedValue(queryParams.search || "", 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  function updateFilter<K extends keyof MusicianFiltersState>(
    name: K,
    value: MusicianFiltersState[K],
  ) {
    navigate({
      replace: true,
      search: (currentSearch) => ({
        ...currentSearch,
        [name]: value,
      }),
    });
  }

  function resetFilter() {
    navigate({
      replace: true,
      search: (currentSearch) => {
        const newSearch: Record<string, unknown> = { ...currentSearch };
        for (const key of Object.keys(DEFAULT_FILTERS)) {
          newSearch[key] = undefined;
        }
        return newSearch;
      },
    });
  }

  const {
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    data,
    isPending,
    isError,
    isSuccess,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "musicians",
      {
        search: debouncedSearch,
        category: queryParams.category,
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        sort: queryParams.sort,
      },
    ],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      fetchMusicians({
        search: debouncedSearch,
        category: queryParams.category ?? "",
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        sort: queryParams.sort ?? "rating-desc",
        offset: pageParam,
        limit: 10,
        signal,
      }),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.results.length;

      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    staleTime: 1000 * 60,
  });

  const totalResults = data?.pages[0]?.total ?? 0;
  const musicians = data?.pages.flatMap((page) => page.results) ?? [];
  const loadedResults = musicians.length;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Encore Musician Search</h1>

      <MusicianFilters
        filters={queryParams}
        onChange={updateFilter}
        onReset={resetFilter}
      />

      <section aria-label="Musician results" className="mt-6">
        <p className="mt-2 text-gray-600">
          Showing {loadedResults} of {totalResults} profiles.
        </p>

        {isPending && <p className="mt-2 text-gray-600">Loading…</p>}

        {isError && (
          <p className="mt-2 text-red-600">Error: {(error as Error).message}</p>
        )}

        {isSuccess && musicians.length === 0 && (
          <p className="mt-2 text-gray-600">No results found.</p>
        )}

        <MusiciansList list={musicians} />

        {hasNextPage && <div ref={loadMoreRef} aria-hidden="true" />}

        <div role="status" className="mt-2 flex justify-end text-gray-600">
          {isFetchingNextPage && <p>Loading more musicians…</p>}
          {!hasNextPage && musicians.length > 0 && (
            <p>You&rsquo;ve reached the end of the results.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default MusicianSearchPage;
