import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MusicianProfile } from "@/types";
import MusiciansList from "./MusiciansList";

const musicians: MusicianProfile[] = [
  {
    url: "/musicians/the-blue-notes",
    title: "The Blue Notes",
    description: "A lively jazz trio.",
    rating: 4.9,
    numReviews: 42,
    photo: "https://example.com/blue-notes.jpg",
    categories: ["Jazz", "Jazz Band"],
    minPrice: 300,
    maxPrice: 700,
    averagePrice: 500,
    location: "London",
  },
  {
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
  },
];

describe("MusiciansList", () => {
  it("renders a card for every musician", () => {
    render(<MusiciansList list={musicians} />);

    const cards = screen.getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole("heading", { name: "The Blue Notes" }),
    ).toBeTruthy();
    expect(within(cards[0]).getByText("A lively jazz trio.")).toBeTruthy();
    expect(
      within(cards[0]).getByText("Rating: 4.9 (42 reviews)"),
    ).toBeTruthy();
    expect(
      within(cards[0]).getByText("Price Range: $300 - $700"),
    ).toBeTruthy();
    expect(within(cards[0]).getByText("Location: London")).toBeTruthy();
  });

  it("renders each musician photo with accessible attributes", () => {
    render(<MusiciansList list={musicians} />);

    const image = screen.getByRole("img", {
      name: "The Blue Notes musician profile",
    });

    expect(image.getAttribute("src")).toBe(
      "https://example.com/blue-notes.jpg",
    );
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("width")).toBe("400");
    expect(image.getAttribute("height")).toBe("300");
  });

  it("renders an empty list when no musicians are provided", () => {
    render(<MusiciansList list={[]} />);

    expect(
      within(screen.getByRole("list")).queryAllByRole("listitem"),
    ).toHaveLength(0);
  });
});
