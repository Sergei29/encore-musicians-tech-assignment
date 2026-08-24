# Code Test - Lead JavaScript Engineer

To help us assess your ability to quickly build React-based features, we've designed a small technical task to give us a feel for how you work under non-interview conditions.

**Important:** please do not use AI-assisted coding tools for this test. Write your own code, and we'll ask you to talk us through it in an interview. We use LLMs in our day-to-day work, we have token budget, but we want to see your engineering skills.

Please spend a maximum of 2 hours on this. We're not looking for a polished product. We want to see how you structure a small feature and the trade-offs you make under a time constraint. It's fine to leave TODOs and notes on what you'd do with more time. 

## The brief

You will build a search page to browse musician profiles. Users should be able to:

- Search by profile name
- Filter by category and by price
- Sort by price (both directions) and by rating

Results should use continuous (infinite) scroll (the API is paginated to support this) and adapt to small and large viewports.

Every API request has 200-900ms of simulated latency. Your UI should handle this latency gracefully: typing should stay responsive and results shouldn't flicker.

What would you expect to see in a production application? What would you consider? You do not need to implement everything, but we would like to know your thinking. 

## What's provided

A minimal [TanStack Start](https://tanstack.com/start) app (React 19 + TypeScript + Tailwind CSS) with the following:

- `GET /api/musicians` - returns musician profiles.
  - Optional params: `q` (name substring), `category`, `minPrice` / `maxPrice`, `sort` (`price-asc` | `price-desc` | `rating`), `offset` / `limit` (default page size 10). Returns `{ results, total, offset, limit }`.
- `GET /api/categories` - returns musician categories.
- A starter page at [src/routes/index.tsx](src/routes/index.tsx).

Each profile includes a name, description, rating, categories, price range and a ready-to-use `photo` URL.

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev
```

## A note on tech

- You may install any additional packages if you wish.
- Tailwind and Vitest are set up, but you can use alternatives.
- Use as much or as little of TanStack Start as you like; vanilla React is fine.

## Submitting

When you're finished, email a zip of your completed test to devs@encoremusicians.com (.git folder is welcome)
