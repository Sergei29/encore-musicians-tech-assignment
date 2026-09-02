import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MusicianFiltersState } from "@/types";
import MusicianFilters from "./MusicianFilters";

const filters: MusicianFiltersState = {
  search: "jazz",
  category: "Jazz Band",
  minPrice: 200,
  maxPrice: 800,
  sort: "rating-desc",
};

describe("MusicianFilters", () => {
  it("renders the current filter values", () => {
    render(
      <MusicianFilters
        filters={filters}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const search = screen.getByRole("searchbox", { name: "Search" });
    const category = screen.getByRole("combobox", { name: "Category" });
    const minPrice = screen.getByRole("spinbutton", { name: "Min price" });
    const maxPrice = screen.getByRole("spinbutton", { name: "Max price" });
    const sort = screen.getByRole("combobox", { name: "Sort by" });

    expect((search as HTMLInputElement).value).toBe("jazz");
    expect((category as HTMLSelectElement).value).toBe("Jazz Band");
    expect((minPrice as HTMLInputElement).value).toBe("200");
    expect((maxPrice as HTMLInputElement).value).toBe("800");
    expect((sort as HTMLSelectElement).value).toBe("rating-desc");
    expect(screen.getByRole("option", { name: "All categories" })).toBeTruthy();
  });

  it("reports changes to each filter", () => {
    const onChange = vi.fn();

    render(
      <MusicianFilters
        filters={filters}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "piano" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Category" }), {
      target: { value: "Pianist" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Min price" }), {
      target: { value: "300" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Max price" }), {
      target: { value: "900" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), {
      target: { value: "price-asc" },
    });

    expect(onChange).toHaveBeenNthCalledWith(1, "search", "piano");
    expect(onChange).toHaveBeenNthCalledWith(2, "category", "Pianist");
    expect(onChange).toHaveBeenNthCalledWith(3, "minPrice", 300);
    expect(onChange).toHaveBeenNthCalledWith(4, "maxPrice", 900);
    expect(onChange).toHaveBeenNthCalledWith(5, "sort", "price-asc");
  });

  it("resets the visible form and calls onReset", () => {
    const onReset = vi.fn();

    render(
      <MusicianFilters
        filters={filters}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reset filters",
      }),
    );

    expect(onReset).toHaveBeenCalledOnce();

    expect(
      (
        screen.getByRole("searchbox", {
          name: "Search",
        }) as HTMLInputElement
      ).value,
    ).toBe("");

    expect(
      (
        screen.getByRole("combobox", {
          name: "Category",
        }) as HTMLSelectElement
      ).value,
    ).toBe("");

    expect(
      (
        screen.getByRole("spinbutton", {
          name: "Min price",
        }) as HTMLInputElement
      ).value,
    ).toBe("");

    expect(
      (
        screen.getByRole("combobox", {
          name: "Sort by",
        }) as HTMLSelectElement
      ).value,
    ).toBe("rating-desc");
  });

  it("synchronizes the form when filter props change", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();

    const { rerender } = render(
      <MusicianFilters
        filters={filters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    rerender(
      <MusicianFilters
        filters={{
          search: "piano",
          category: "Pianist",
          minPrice: 400,
          maxPrice: undefined,
          sort: "price-asc",
        }}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(
      (
        screen.getByRole("searchbox", {
          name: "Search",
        }) as HTMLInputElement
      ).value,
    ).toBe("piano");

    expect(
      (
        screen.getByRole("combobox", {
          name: "Category",
        }) as HTMLSelectElement
      ).value,
    ).toBe("Pianist");

    expect(
      (
        screen.getByRole("spinbutton", {
          name: "Min price",
        }) as HTMLInputElement
      ).value,
    ).toBe("400");

    expect(
      (
        screen.getByRole("spinbutton", {
          name: "Max price",
        }) as HTMLInputElement
      ).value,
    ).toBe("");

    expect(
      (
        screen.getByRole("combobox", {
          name: "Sort by",
        }) as HTMLSelectElement
      ).value,
    ).toBe("price-asc");
  });
});
