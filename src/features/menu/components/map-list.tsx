"use client";

import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";

import { ListSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useGeolocation } from "../hooks/use-geolocation";
import { getPriceLevel, getPriceRange } from "../utils/map";
import { StarRating } from "./star-rating";

const ListHeading = () => (
  <p className="font-bold">Places nearby that are currently OPEN! 🍽️</p>
);

export const MapList = () => {
  const { places, isLoadingPlaces, setActiveMarker } = useMapStore();
  const { retry } = useGeolocation();

  const isMapsAPIReady = useApiIsLoaded();
  const status = useApiLoadingStatus();

  if (isLoadingPlaces || !isMapsAPIReady || status === "LOADING") {
    return (
      <div className="h-fit space-y-2 overflow-y-auto rounded-md border border-neutral-600 bg-neutral-800/50 p-4">
        <ListHeading />
        <ListSkeleton />
      </div>
    );
  }

  //  TODO: These should be selectable, and saved in a list for use in the spinning wheel
  return (
    <div className="h-fit space-y-2 overflow-y-auto rounded-md border border-neutral-600 bg-neutral-800/50 p-4">
      {places && places.length > 0 ? (
        <>
          <ListHeading />
          <ul>
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
                    <StarRating rating={place.rating ?? 0} />
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
                      href={`https://www.google.com/maps/place/?q=place_id:${place.id}`}
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
        </>
      ) : (
        <>
          <div className="text-neutral-100">No places found</div>
          <button
            className="rounded-md border border-blue-500 bg-blue-500 p-4 font-bold text-blue-100"
            onClick={retry}
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
};
