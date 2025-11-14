"use client";

import { useMedia } from "react-use";

import "@/css/map.css";
import { DesktopPlacesList } from "@/features/menu/components/desktop-places-list";
import GoogleMap from "@/features/menu/components/map";
import { MEDIA_QUERIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  const isDesktop = useMedia(MEDIA_QUERIES.DESKTOP, false);
  const PlacesSelectionComponent = isDesktop
    ? DesktopPlacesList
    : () => <div />;

  return (
    <div className="flex max-h-dvh flex-1 flex-col">
      <div className="w-full border-b border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-2">
          <img
            src="/favicon.ico"
            alt="Flavour of the Week"
            className="size-6 lg:size-8"
          />
          <h1 className="text-lg font-bold lg:text-2xl">Flavour of the Week</h1>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto grid size-full max-w-7xl grid-cols-1 gap-4 overflow-hidden px-4 py-4",
          "lg:grid-cols-2",
        )}
      >
        <GoogleMap />
        <PlacesSelectionComponent />
      </div>
    </div>
  );
}
