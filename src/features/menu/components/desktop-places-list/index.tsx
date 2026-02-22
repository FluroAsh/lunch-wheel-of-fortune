"use client";

import { useRef } from "react";

import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { MessageCircleWarning } from "lucide-react";

import { ListSkeleton } from "@/components/skeleton";
import { useMapStore } from "@/store";
import type { GooglePlace } from "@/types/google";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { WheelSpinButton } from "../wheel-spin-button";
import { ListRow } from "./list-row";

const ListHeading = ({ places = [] }: { places?: GooglePlace[] }) => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();

  const action = selectedPlaceIds.length > 1 ? "clear" : "select";

  const handleSelectionClick = () => {
    setSelectedPlaceIds(
      action === "clear" ? [selectedPlaceIds[0]] : places.map((p) => p.id),
    );
  };

  return (
    <div className="flex items-center justify-between pb-2">
      <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
        Open Nearby Now
      </span>

      {places.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-300">
            {selectedPlaceIds.length} selected
          </span>

          <button
            type="button"
            className="rounded-md px-2 py-0.5 text-xs font-medium text-sky-400 transition-colors hover:cursor-pointer hover:bg-neutral-800 hover:text-sky-300"
            onClick={handleSelectionClick}
          >
            {action === "clear" ? "Clear" : "Select All"}
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
      <div className="flex h-fit max-h-full flex-col gap-3 overflow-hidden">
        <ListHeading />
        <ListSkeleton />
      </div>
    );
  }

  const listHasOverflow =
    listRef.current &&
    listRef.current.scrollHeight > listRef.current.clientHeight;

  return (
    <div className="flex max-h-full flex-col gap-3 overflow-hidden">
      <ListHeading places={places} />

      {places.length > 0 ? (
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-md">
          <ul ref={listRef} className="h-full overflow-y-auto">
            {places.map((place, idx) => (
              <ListRow key={place.id} place={place} isEven={idx % 2 === 0} />
            ))}
          </ul>
          {listHasOverflow && (
            <div className="to-background pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-b from-transparent" />
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-4 text-center">
          <MessageCircleWarning className="mx-auto mb-2 size-5 stroke-amber-400" />
          <p className="text-sm font-semibold text-amber-300">
            No places found nearby
          </p>
          <p className="mt-1 text-xs text-amber-500">
            Try searching a different location or expanding your radius.
          </p>
        </div>
      )}

      {/* Spin CTA — separated from the list with a clear visual boundary */}
      <div className="shrink-0 border-t border-neutral-800 pt-3">
        <WheelSpinButton isLoading={isFetchingPlaces} />
      </div>
    </div>
  );
};
