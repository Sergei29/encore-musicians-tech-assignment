import { createFileRoute } from "@tanstack/react-router";
import MusicianSearchPage from "@/components/MusicianSearchPage";

export const Route = createFileRoute("/")({
  component: MusicianSearchPage,
});
