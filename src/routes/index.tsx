import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import type { MusicianFiltersState } from "@/types";

import { DEFAULT_FILTERS, fetchMusicians } from "@/lib";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import MusiciansList from "@/components/MusiciansList";
import MusicianFilters from "@/components/MusicianFilters";

export const Route = createFileRoute("/")({ component: Home });

/**
 * Starter code only — this simply proves the API wiring works.
 * Replace it with your search page.
 */
function Home() {
  const [filters, setFilters] = useState<MusicianFiltersState>(DEFAULT_FILTERS);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function updateFilter<K extends keyof MusicianFiltersState>(
    name: K,
    value: MusicianFiltersState[K],
  ) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
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
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
      },
    ],

    initialPageParam: 0,

    queryFn: ({ pageParam, signal }) =>
      fetchMusicians({
        search: debouncedSearch,
        category: filters.category,
        minPrice:
          filters.minPrice === "" ? undefined : Number(filters.minPrice),
        maxPrice:
          filters.maxPrice === "" ? undefined : Number(filters.maxPrice),
        sort: filters.sort,
        offset: pageParam,
        limit: 10,
        signal,
      }),

    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.results.length;

      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
          fetchNextPage();
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
        filters={filters}
        onChange={updateFilter}
        onReset={() => setFilters(DEFAULT_FILTERS)}
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

        {hasNextPage && (
          <div key="hasNextPage" ref={loadMoreRef} aria-hidden="true" />
        )}

        <div role="status" className="mt-2 text-gray-600 flex justify-end">
          {isFetchingNextPage && <p>Loading more musicians…</p>}
          {!hasNextPage && musicians.length > 0 && (
            <p>You&rsquo;ve reached the end of the results.</p>
          )}
        </div>
      </section>
    </main>
  );
}
