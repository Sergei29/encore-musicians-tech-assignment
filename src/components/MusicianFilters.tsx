"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, DEFAULT_FILTERS } from "@/lib";
import type { MusicianFiltersState, MusicianSort } from "@/types";

interface MusicianFilterFormState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: MusicianSort;
}

function toFormState(filters: MusicianFiltersState): MusicianFilterFormState {
  return {
    search: filters.search ?? "",
    category: filters.category ?? "",
    minPrice: filters.minPrice === undefined ? "" : String(filters.minPrice),
    maxPrice: filters.maxPrice === undefined ? "" : String(filters.maxPrice),
    sort: filters.sort ?? "rating-desc",
  };
}

interface Props {
  filters: MusicianFiltersState;
  onChange: <K extends keyof MusicianFiltersState>(
    name: K,
    value: MusicianFiltersState[K],
  ) => void;
  onReset: () => void;
}

const MusicianFilters = ({ filters, onChange, onReset }: Props) => {
  const [formState, setFormState] = useState(() => toFormState(filters));

  useEffect(() => {
    setFormState(toFormState(filters));
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ]);

  return (
    <section
      aria-label="Musician filters"
      className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <label className="flex flex-col gap-1" htmlFor="search">
        <span className="text-sm font-medium text-gray-700">Search</span>
        <input
          id="search"
          type="search"
          value={formState.search}
          onChange={(event) => {
            const value = event.target.value;

            setFormState((current) => ({
              ...current,
              search: value,
            }));

            onChange("search", value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1" htmlFor="category">
        <span className="text-sm font-medium text-gray-700">Category</span>
        <select
          id="category"
          value={formState.category}
          onChange={(event) => {
            const value = event.target.value;

            setFormState((current) => ({
              ...current,
              category: value,
            }));

            onChange("category", value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">All categories</option>

          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1" htmlFor="minPrice">
        <span className="text-sm font-medium text-gray-700">Min price</span>
        <input
          id="minPrice"
          type="number"
          min="0"
          value={formState.minPrice}
          onChange={(event) => {
            setFormState((current) => ({
              ...current,
              minPrice: event.target.value,
            }));

            onChange(
              "minPrice",
              event.target.value === ""
                ? undefined
                : event.target.valueAsNumber,
            );
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1" htmlFor="maxPrice">
        <span className="text-sm font-medium text-gray-700">Max price</span>
        <input
          id="maxPrice"
          type="number"
          min="0"
          value={formState.maxPrice}
          onChange={(event) => {
            setFormState((current) => ({
              ...current,
              maxPrice: event.target.value,
            }));

            onChange(
              "maxPrice",
              event.target.value === ""
                ? undefined
                : event.target.valueAsNumber,
            );
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1" htmlFor="sort">
        <span className="text-sm font-medium text-gray-700">Sort by</span>
        <select
          id="sort"
          value={formState.sort}
          onChange={(event) => {
            const value = event.target.value as MusicianSort;

            setFormState((current) => ({
              ...current,
              sort: value,
            }));

            onChange("sort", value);
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="rating-desc">Rating: High to Low</option>
          <option value="rating-asc">Rating: Low to High</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </label>

      <div className="mt-auto mb-1">
        <button
          type="button"
          onClick={() => {
            setFormState(toFormState(DEFAULT_FILTERS));
            onReset();
          }}
          className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium cursor-pointer"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
};

export default MusicianFilters;
