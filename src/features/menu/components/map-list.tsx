"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { MessageCircleWarning } from "lucide-react";
import { useMedia } from "react-use";

import { ListSkeleton } from "@/components/skeleton";
import { MEDIA_QUERIES } from "@/lib/constants";
import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { getPriceLevel, getPriceRange } from "../utils/map";
import { StarRating } from "./star-rating";

const ListHeading = () => (
  <p className="ml-2 pb-2 text-xs font-bold text-neutral-400 uppercase">
    Open Nearby Now
  </p>
);

export const MapList = () => {
  const { setActiveMarker } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();

  const isDesktop = useMedia(MEDIA_QUERIES.DESKTOP, false);

  const isMapsAPIReady = useApiIsLoaded();
  const mapsLoadingState = useApiLoadingStatus();

  if (isFetchingPlaces || !isMapsAPIReady || mapsLoadingState === "LOADING") {
    return (
      <div className="flex h-fit max-h-full flex-col overflow-hidden">
        <ListHeading />
        <ListSkeleton />
      </div>
    );
  }

  //  TODO: These should be selectable, and saved in a list for use in the spinning wheel
  return (
    <div className="flex h-fit max-h-full flex-col overflow-hidden">
      <ListHeading />
      {places.length > 0 ? (
        <ul
          // TODO: Add a transparent gradient to the bottom of the list to indicate that there is more content to scroll through
          className="h-full overflow-y-auto"
        >
          {places.map((place, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === places.length - 1;
            const isEven = idx % 2 === 0;

            const priceLevel = getPriceLevel(place.priceLevel);
            const { startPrice } = getPriceRange(place.priceRange);

            const displayPrice = priceLevel
              ? priceLevel
              : startPrice
                ? `$${Number(startPrice.units).toFixed(2)}`
                : "—";

            return (
              <li className="flex gap-2" key={place.id}>
                <div
                  className={cn(
                    "flex w-48 justify-between bg-neutral-700/50 px-2",
                    isFirst && "rounded-t-md pt-2",
                    isLast && "rounded-b-md pb-2",
                    isEven ? "bg-neutral-700/50" : "bg-neutral-700/25",
                  )}
                >
                  <StarRating
                    rating={place.rating ?? 0}
                    isMobile={!isDesktop}
                  />
                  <span className="flex items-center pl-0.5 text-sm">
                    {displayPrice}
                  </span>
                </div>

                <div
                  className={cn(
                    "w-full overflow-hidden",
                    isFirst && "rounded-t-md pt-2",
                    isLast && "rounded-b-md pb-2",
                    isEven ? "bg-neutral-700/50" : "bg-neutral-700/25",
                  )}
                >
                  <a
                    className="block w-fit max-w-full truncate px-2 hover:text-blue-500 hover:underline"
                    href={getPlacesSearchUrl(place)}
                    target="_blank"
                    onMouseEnter={() => setActiveMarker(place.id)}
                    onMouseLeave={() => setActiveMarker(undefined)}
                  >
                    {place.displayName.text}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-neutral-md mx-2 rounded-sm border border-amber-500 bg-amber-800/20 p-2 px-2 text-center">
          <span className="text-center">
            <MessageCircleWarning className="-mt-1 mr-1 inline size-4 stroke-amber-200" />
            <span className="font-bold text-amber-200">
              Uh oh, we couldn&apos;t find any places near you!
            </span>
          </span>
          <p className="text-sm text-amber-400">
            Try again by either searching for a different location or adjusting
            the radius of your search.
          </p>
        </div>
      )}
    </div>
  );
};
