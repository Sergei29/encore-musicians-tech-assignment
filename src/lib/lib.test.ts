import { afterEach, describe, expect, it, vi } from "vitest";
import type { FetchMusiciansParams, MusicianSearchResponse } from "@/types";
import { fetchMusicians } from "./index";

const responseData: MusicianSearchResponse = {
  results: [],
  total: 24,
  offset: 10,
  limit: 5,
};

const requiredParams: FetchMusiciansParams = {
  search: "",
  category: "",
  sort: "price-asc",
  offset: 0,
};

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("fetchMusicians", () => {
  it("requests musicians with active filters and pagination parameters", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const controller = new AbortController();

    const result = await fetchMusicians({
      search: "  jazz trio  ",
      category: "Jazz Band",
      minPrice: 200,
      maxPrice: 900,
      sort: "price-desc",
      offset: 10,
      limit: 5,
      signal: controller.signal,
    });

    expect(result).toEqual(responseData);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [request, options] = fetchMock.mock.calls[0];
    const url = new URL(String(request), "http://localhost");

    expect(url.pathname).toBe("/api/musicians");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      offset: "10",
      limit: "5",
      q: "jazz trio",
      category: "Jazz Band",
      minPrice: "200",
      maxPrice: "900",
      sort: "price-desc",
    });
    expect(options?.signal).toBe(controller.signal);
  });

  it("omits inactive filters and uses the default page limit", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await fetchMusicians(requiredParams);

    const [request] = fetchMock.mock.calls[0];
    const url = new URL(String(request), "http://localhost");

    expect(Object.fromEntries(url.searchParams)).toEqual({
      offset: "0",
      limit: "10",
      sort: "price-asc",
    });
    expect(url.searchParams.has("q")).toBe(false);
    expect(url.searchParams.has("category")).toBe(false);
    expect(url.searchParams.has("minPrice")).toBe(false);
    expect(url.searchParams.has("maxPrice")).toBe(false);
  });

  it("throws when the server returns an unsuccessful response", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(fetchMusicians(requiredParams)).rejects.toThrow(
      "Failed to fetch musicians: 500",
    );
  });
});
