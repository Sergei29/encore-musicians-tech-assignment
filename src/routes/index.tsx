import { createFileRoute } from "@tanstack/react-router";
import MusicianSearchPage from "@/components/MusicianSearchPage";

export const Route = createFileRoute("/")({
  loader: async (ctx) => {
    console.log("Loading route: ", ctx.location.search);
    // SSR prefetch query
    return Promise.resolve();
  },
  component: MusicianSearchPage,
});
