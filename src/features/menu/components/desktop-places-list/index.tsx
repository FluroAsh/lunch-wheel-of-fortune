"use client";

import { useRef } from "react";

import { useApiIsLoaded, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { MessageCircleWarning } from "lucide-react";
import { useMedia } from "react-use";

import { ListSkeleton } from "@/components/skeleton";
import { MEDIA_QUERIES } from "@/lib/constants";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { ListRow } from "./row";

const ListHeading = () => (
  <p className="ml-2 pb-2 text-xs font-bold text-neutral-400 uppercase">
    Open Nearby Now
  </p>
);

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

  //  TODO: These should be selectable, and saved in a list for use in the spinning wheel
  return (
    <div className="flex max-h-full flex-col overflow-hidden">
      <ListHeading />
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
