"use client";

import { useRef } from "react";

import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { MessageCircleWarning } from "lucide-react";

import { ListSkeleton } from "@/components/skeleton";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { ListRow } from "./row";

const ListHeading = ({ places = [] }: { places?: GooglePlace[] }) => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();

  const action = selectedPlaceIds.length > 1 ? "clear" : "select";

  const handleSelectionClick = () => {
    setSelectedPlaceIds(
      action === "clear" ? [selectedPlaceIds[0]] : places.map((p) => p.id),
    );
  };

  return (
    <div className="flex h-7 items-center justify-between pb-2 leading-tight">
      <span className="gap-2 text-xs font-bold text-neutral-400 uppercase">
        Open Nearby Now
      </span>

      {places.length > 0 && (
        <div className="space-x-2">
          <span className="text-xs font-bold text-neutral-100">
            {selectedPlaceIds.length} Places Selected
          </span>

          <button
            className="text-xs text-sky-500 underline hover:cursor-pointer"
            onClick={handleSelectionClick}
          >
            {action === "clear" ? "Clear Selection" : "Select All"}
          </button>
        </div>
      )}
    </div>
  );
};

export const DesktopPlacesList = () => {
  const listRef = useRef<HTMLUListElement>(null);
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();

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

  const listHasOverflow =
    listRef.current &&
    listRef.current.scrollHeight > listRef.current.clientHeight;

  return (
    <div className="flex max-h-full flex-col overflow-hidden">
      <ListHeading places={places} />
      {places.length > 0 ? (
        <div className="relative overflow-hidden rounded-md">
          <ul ref={listRef} className="overflow-y-auto">
            {places.map((place, idx) => (
              <ListRow key={place.id} place={place} isEven={idx % 2 === 0} />
            ))}
          </ul>
          {listHasOverflow && (
            <div className="to-background absolute right-0 bottom-0 left-0 h-20 translate-y-1/2 bg-gradient-to-b from-transparent" />
          )}
        </div>
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
