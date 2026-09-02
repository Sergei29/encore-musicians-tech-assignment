import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MusicianFiltersState,
  MusicianProfile,
  MusicianSearchResponse,
} from "@/types";
import { fetchMusicians } from "@/lib";
import MusicianSearchPage from "./MusicianSearchPage";

interface MusicianFiltersStubProps {
  filters: MusicianFiltersState;
  onChange: <K extends keyof MusicianFiltersState>(
    name: K,
    value: MusicianFiltersState[K],
  ) => void;
}

interface MusiciansListStubProps {
  list: MusicianProfile[];
}

vi.mock("@/lib", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib")>();

  return {
    ...actual,
    fetchMusicians: vi.fn(),
  };
});

vi.mock("./MusicianFilters", () => ({
  default: ({ filters, onChange }: MusicianFiltersStubProps) => (
    <label>
      Search
      <input
        type="search"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
    </label>
  ),
}));

vi.mock("./MusiciansList", () => ({
  default: ({ list }: MusiciansListStubProps) => (
    <ul aria-label="Musicians">
      {list.map((musician) => (
        <li key={musician.url}>{musician.title}</li>
      ))}
    </ul>
  ),
}));

const fetchMusiciansMock = vi.mocked(fetchMusicians);

const firstMusician: MusicianProfile = {
  url: "/musicians/the-blue-notes",
  title: "The Blue Notes",
  description: "A lively jazz trio.",
  rating: 4.9,
  numReviews: 42,
  photo: "https://example.com/blue-notes.jpg",
  categories: ["Jazz Band"],
  minPrice: 300,
  maxPrice: 700,
  averagePrice: 500,
  location: "London",
};

const secondMusician: MusicianProfile = {
  url: "/musicians/alex-rivers",
  title: "Alex Rivers",
  description: "Acoustic music for intimate events.",
  rating: 4.7,
  numReviews: 18,
  photo: "https://example.com/alex-rivers.jpg",
  categories: ["Acoustic Guitarist"],
  minPrice: 200,
  maxPrice: 450,
  averagePrice: 325,
  location: "Manchester",
};

function createResponse(
  results: MusicianProfile[],
  total = results.length,
  offset = 0,
): MusicianSearchResponse {
  return {
    results,
    total,
    offset,
    limit: 10,
  };
}

let queryClient: QueryClient;
let intersectionCallback: IntersectionObserverCallback | undefined;
const observeMock = vi.fn();
const disconnectMock = vi.fn();

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [0];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe(element: Element) {
    observeMock(element);
  }

  disconnect() {
    disconnectMock();
  }

  unobserve() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function createTestRouter(initialUrl = "/") {
  const rootRoute = createRootRoute({
    component: Outlet,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: MusicianSearchPage,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialUrl],
    }),
  });
}

async function renderPage(initialUrl = "/") {
  const router = createTestRouter(initialUrl);

  await router.load();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return {
    ...result,
    router,
  };
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  intersectionCallback = undefined;
  observeMock.mockReset();
  disconnectMock.mockReset();
  fetchMusiciansMock.mockReset();

  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("MusicianSearchPage", () => {
  it("shows loading and then renders the first page with its total", async () => {
    fetchMusiciansMock.mockResolvedValueOnce(createResponse([firstMusician]));

    await renderPage();

    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(await screen.findByText(firstMusician.title)).toBeTruthy();
    expect(screen.getByText("Showing 1 of 1 profiles.")).toBeTruthy();
    expect(
      screen.getByText("You’ve reached the end of the results."),
    ).toBeTruthy();
  });

  it("applies the debounced search value to a new query", async () => {
    vi.useFakeTimers();
    fetchMusiciansMock.mockResolvedValue(createResponse([]));

    await renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });

    expect(fetchMusiciansMock).toHaveBeenCalledOnce();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "piano" },
    });

    expect(fetchMusiciansMock).toHaveBeenCalledOnce();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });

    expect(fetchMusiciansMock).toHaveBeenCalledOnce();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(fetchMusiciansMock).toHaveBeenCalledTimes(2);

    expect(fetchMusiciansMock.mock.calls[1][0]).toMatchObject({
      search: "piano",
      offset: 0,
    });
  });

  it("renders a query error", async () => {
    fetchMusiciansMock.mockRejectedValueOnce(
      new Error("Could not load musicians"),
    );

    await renderPage();

    expect(
      await screen.findByText("Error: Could not load musicians"),
    ).toBeTruthy();
  });

  it("fetches and appends the next page when the sentinel intersects", async () => {
    fetchMusiciansMock
      .mockResolvedValueOnce(createResponse([firstMusician], 2, 0))
      .mockResolvedValueOnce(createResponse([secondMusician], 2, 1));

    await renderPage();

    expect(await screen.findByText(firstMusician.title)).toBeTruthy();
    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledOnce();
    });

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(await screen.findByText(secondMusician.title)).toBeTruthy();
    expect(
      screen.getByRole("list", { name: "Musicians" }).children,
    ).toHaveLength(2);
    expect(fetchMusiciansMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ offset: 1 }),
    );
  });
});
