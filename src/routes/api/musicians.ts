import { createFileRoute } from "@tanstack/react-router";
import { searchMusicians } from "../../server/musicians";

export const Route = createFileRoute("/api/musicians")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const result = await searchMusicians(new URL(request.url).searchParams);
        return Response.json(result);
      }
    }
  }
});
