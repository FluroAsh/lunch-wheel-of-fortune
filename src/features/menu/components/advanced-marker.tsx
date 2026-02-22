import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { LucideExternalLink, LucideMapPin } from "lucide-react";

import { GENERIC_PLACE_ICON } from "@/lib/constants";
import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn, getLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";
import type { GooglePlace } from "@/types/google";

import { getPriceLevel, getPriceRange } from "../utils/map";
import { StarRating } from "./star-rating";

export const AdvancedMarkerComponent = ({ place }: { place: GooglePlace }) => {
  const { activeMarker, setActiveMarker } = useMapStore();
  const [markerRef, marker] = useAdvancedMarkerRef();

  const toggleInfoWindow = () => {
    setActiveMarker(activeMarker === place.id ? undefined : place.id);
  };

  const { lat, lng } = getLatLng(place);

  if (!lat || !lng) {
    return null;
  }

  const isMarkerActive = activeMarker === place.id;

  const priceLevel = getPriceLevel(place.priceLevel);
  const { readablePriceRange } = getPriceRange(place.priceRange);

  return (
    <AdvancedMarker
      zIndex={1000}
      ref={markerRef}
      position={{ lat, lng }}
      onClick={toggleInfoWindow}
      className={cn(
        "transition-transform duration-300",
        // Google marker default z-index is 1000
        isMarkerActive && "z-[1001] scale-125",
      )}
    >
      {/* NOTE: Pin must be added explicitly as we have an InfoWindow as a child */}
      <div>
        <Pin
          // @ts-expect-error - glyphSrc is a valid prop for the Pin component but not typed
          glyphSrc={`${place.iconMaskBaseUri ?? GENERIC_PLACE_ICON}.svg`}
          background="#0f9d58"
          borderColor="#006425"
          glyphColor="#60d98f"
        />
      </div>

      {isMarkerActive && (
        <InfoWindow
          onCloseClick={toggleInfoWindow}
          anchor={marker}
          headerContent={
            <div className="flex flex-col gap-0.5 pr-4">
              <p className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">
                {place.primaryTypeDisplayName?.text ?? "Place"}
              </p>
              <h3 className="text-base leading-tight font-bold text-neutral-100">
                {place.displayName.text}
              </h3>
            </div>
          }
        >
          <div className="flex min-w-[180px] flex-col gap-2.5 px-3 pt-2.5 pb-3">
            {/* Rating row */}
            {place.rating && (
              <div className="flex items-center gap-2">
                <StarRating rating={place.rating} />
                <span className="text-xs font-semibold text-amber-400">
                  {place.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Address row */}
            {place.shortFormattedAddress && (
              <div className="flex items-start gap-1.5 text-xs text-neutral-300">
                <LucideMapPin className="mt-px size-3 shrink-0 stroke-neutral-400" />
                <span className="leading-tight">
                  {place.shortFormattedAddress}
                </span>
              </div>
            )}

            {/* Price row */}
            {(priceLevel || readablePriceRange) && (
              <div className="flex items-center gap-1.5">
                {priceLevel && (
                  <span className="rounded-full border border-neutral-600 px-2 py-0.5 text-[11px] font-medium text-neutral-200">
                    {priceLevel}
                  </span>
                )}
                {readablePriceRange && (
                  <span className="text-xs font-medium text-neutral-300">
                    {readablePriceRange}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <a
            href={getPlacesSearchUrl({ placeName: place.displayName.text, placeId: place.id })}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-center justify-center gap-1.5 px-3 py-2.5",
              "border-t border-neutral-700/60",
              "text-xs font-medium text-neutral-400",
              "transition-colors hover:text-emerald-400",
            )}
          >
            View on Google Maps
            <LucideExternalLink className="size-3" />
          </a>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};
