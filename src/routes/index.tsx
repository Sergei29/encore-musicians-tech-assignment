import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import type {
  MusicianSearchResponse,
  FetchMusiciansParams,
  MusicianSort,
} from "../types";
import { CATEGORIES } from "../lib";

export const Route = createFileRoute("/")({ component: Home });

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

const fetchMusicians = async ({
  search,
  category,
  minPrice,
  maxPrice,
  sort,
  offset,
  limit = 10,
  signal,
}: FetchMusiciansParams): Promise<MusicianSearchResponse> => {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set("q", trimmedSearch);
  }

  if (category) {
    params.set("category", category);
  }

  if (minPrice !== undefined) {
    params.set("minPrice", String(minPrice));
  }

  if (maxPrice !== undefined) {
    params.set("maxPrice", String(maxPrice));
  }

  if (sort) {
    params.set("sort", sort);
  }

  const response = await fetch(`/api/musicians?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch musicians: ${response.status}`);
  }

  return response.json() as Promise<MusicianSearchResponse>;
};
/**
 * Starter code only — this simply proves the API wiring works.
 * Replace it with your search page.
 */
function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState<MusicianSort>("rating-desc");

  const debouncedSearch = useDebouncedValue(search, 300);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("rating-desc");
  };

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
        category,
        minPrice,
        maxPrice,
        sort,
      },
    ],

    initialPageParam: 0,

    queryFn: ({ pageParam, signal }) =>
      fetchMusicians({
        search: debouncedSearch,
        category,
        minPrice: minPrice === "" ? undefined : Number(minPrice),
        maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        sort,
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
      <section
        aria-label="Musician filters"
        className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div className="gap-0 flex flex-col">
          <label className="text-sm font-medium text-gray-700" htmlFor="search">
            Search
          </label>
          <input
            type="text"
            id="search"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
        </div>

        <div className="gap-0 flex flex-col">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="" key="all">
              All categories
            </option>
            {CATEGORIES.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </div>

        <div className="gap-0 flex flex-col">
          <label
            htmlFor="minPrice"
            className="text-sm font-medium text-gray-700"
          >
            Min Price
          </label>
          <input
            type="text"
            id="minPrice"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
            }}
          />
        </div>
        <div className="gap-0 flex flex-col">
          <label
            htmlFor="maxPrice"
            className="text-sm font-medium text-gray-700"
          >
            Max Price
          </label>
          <input
            type="text"
            id="maxPrice"
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
            }}
          />
        </div>

        <div className="gap-0 flex flex-col">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as MusicianSort)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="rating-asc">Rating: Low to High</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-auto mb-1">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md bg-gray-200 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </section>

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

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.map((musician) => (
            <li
              key={musician.url}
              className="border border-gray-300 rounded-md p-2 overflow-hidden"
            >
              <img
                src={musician.photo}
                alt={`${musician.title} musician profile`}
                className="aspect-4/3 w-full object-cover"
                loading="lazy"
                width={400}
                height={300}
              />
              <h2 className="text-lg font-semibold">{musician.title}</h2>
              <p>{musician.description}</p>
              <p>
                Rating: {musician.rating} ({musician.numReviews} reviews)
              </p>
              <p>
                Price Range: ${musician.minPrice} - ${musician.maxPrice}
              </p>
              <p>Location: {musician.location}</p>
            </li>
          ))}
        </ul>

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
