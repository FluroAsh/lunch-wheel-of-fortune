"use client";

import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";

import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useGeolocation } from "../hooks/use-geolocation";
import { getPriceLevel, getStarRating } from "../utils/map";
import { MapSkeleton } from "./map-skeleton";

export const MapList = () => {
  const { places, isLoadingPlaces, setActiveMarker } = useMapStore();
  const { retry } = useGeolocation();

  const isMapsAPIReady = useApiIsLoaded();
  const status = useApiLoadingStatus();

  if (isLoadingPlaces || !isMapsAPIReady || status === "LOADING") {
    return <MapSkeleton />;
  }

  //  TODO: These should be selectable, and saved in a list for use in the spinning wheel
  return places && places.length > 0 ? (
    <div className="my-2 max-w-[800px] space-y-2 overflow-y-auto rounded-md border border-neutral-300 bg-neutral-800/50 p-2">
      <p className="font-bold">Places nearby that are currently OPEN! 🍽️</p>
      <ul>
        {places.map((place, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === places.length - 1;
          const isEven = idx % 2 === 0;

          return (
            <li className="flex gap-2" key={place.place_id}>
              <div
                className={cn(
                  "flex w-40 justify-between bg-neutral-700/50 px-2",
                  isFirst && "rounded-t-md pt-2",
                  isLast && "rounded-b-md pb-2",
                  isEven ? "bg-neutral-700/50" : "bg-neutral-700/25",
                )}
              >
                <span>{getStarRating(Math.round(place.rating ?? 0))}</span>
                <span>{getPriceLevel(place.price_level ?? 0)}</span>
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
                  href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                  target="_blank"
                  onMouseEnter={() => setActiveMarker(place.place_id)}
                  onMouseLeave={() => setActiveMarker(undefined)}
                >
                  {place.name}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <div className="my-2 max-w-[800px] overflow-y-auto rounded-md border border-neutral-300 bg-neutral-800/50 p-2">
      <div className="text-neutral-100">No places found</div>
      <button
        className="rounded-md border border-blue-500 bg-blue-500 p-2 font-bold text-blue-100"
        onClick={retry}
      >
        Try again
      </button>
    </div>
  );
};
