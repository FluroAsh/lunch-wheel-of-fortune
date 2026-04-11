"use client";

import { useMedia } from "react-use";

import "@/css/map.css";
import { DesktopPlacesList } from "@/features/menu/components/desktop-places";
import GoogleMap from "@/features/menu/components/map";
import { MobilePlacesWithDrawer } from "@/features/menu/components/mobile-places";
import { MEDIA_QUERIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  const isDesktop = useMedia(MEDIA_QUERIES.DESKTOP, false);
  const SelectionComponent = isDesktop
    ? DesktopPlacesList
    : MobilePlacesWithDrawer;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Content grid */}
      <div
        className={cn(
          "mx-auto grid size-full max-w-7xl overflow-hidden px-4 py-4",
          // Mobile: map takes 60% height, controls 40%
          "grid-cols-1 grid-rows-[3fr_2fr] gap-3",
          // Desktop: equal columns
          "lg:grid-cols-2 lg:grid-rows-1 lg:gap-4",
        )}
      >
        <GoogleMap />
        <SelectionComponent />
      </div>
    </div>
  );
}
