import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MusicianFiltersState } from "@/types";
import MusicianFilters from "./MusicianFilters";

const filters: MusicianFiltersState = {
  search: "jazz",
  category: "Jazz Band",
  minPrice: "200",
  maxPrice: "800",
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
    expect(onChange).toHaveBeenNthCalledWith(3, "minPrice", "300");
    expect(onChange).toHaveBeenNthCalledWith(4, "maxPrice", "900");
    expect(onChange).toHaveBeenNthCalledWith(5, "sort", "price-asc");
  });

  it("calls onReset when reset is selected", () => {
    const onReset = vi.fn();

    render(
      <MusicianFilters
        filters={filters}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(onReset).toHaveBeenCalledOnce();
  });
});
