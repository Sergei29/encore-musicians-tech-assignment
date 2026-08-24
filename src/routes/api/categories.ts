import { createFileRoute } from "@tanstack/react-router";
import { getCategories } from "../../server/musicians";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => Response.json(await getCategories())
    }
  }
});
