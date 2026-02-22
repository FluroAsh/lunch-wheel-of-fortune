"use client";

import Image from "next/image";

import { useMedia } from "react-use";

import "@/css/map.css";
import { DesktopPlacesList } from "@/features/menu/components/desktop-places-list";
import GoogleMap from "@/features/menu/components/map";
import { MobilePlacesWithDrawer } from "@/features/menu/components/mobile-places-drawer";
import { MEDIA_QUERIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  const isDesktop = useMedia(MEDIA_QUERIES.DESKTOP, false);
  const SelectionComponent = isDesktop
    ? DesktopPlacesList
    : MobilePlacesWithDrawer;

  return (
    <div className="flex max-h-dvh flex-1 flex-col">
      {/* Header */}
      <header className="w-full shrink-0 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Image
            src="/favicon.ico"
            alt="Wheel of Flavours"
            width={32}
            height={32}
            className="size-7 lg:size-8"
          />
          <div>
            <h1 className="text-base leading-tight font-semibold text-neutral-100 lg:text-lg">
              Wheel of Flavours
            </h1>
            <p className="text-xs text-neutral-400">
              Spin the wheel. Let fate decide lunch.
            </p>
          </div>
        </div>
      </header>

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
