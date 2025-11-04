import { useState } from "react";

import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

import { cn /*, getAspectRatio */, getLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { getPriceLevel, getPriceRange } from "../utils/map";

export const AdvancedMarkerComponent = ({ place }: { place: GooglePlace }) => {
  const { activeMarker, setActiveMarker } = useMapStore();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const toggleInfoWindow = () => {
    setInfoWindowShown((isShown) => !isShown);
    setActiveMarker(activeMarker === place.id ? undefined : place.id);
  };

  const { lat, lng } = getLatLng(place);

  if (!lat || !lng) {
    return null;
  }

  // const { opening_hours, photos } = place;
  // const hasOpeningHours = opening_hours !== undefined;

  // const mainPhoto = photos?.[0];
  // const imageUrl = mainPhoto?.getUrl?.();
  // const imageWidth = mainPhoto?.width;
  // const imageHeight = mainPhoto?.height;

  // const hasImage = !!(imageUrl && imageWidth && imageHeight);
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
        "opacity-50 transition-[opacity_transform] duration-300",
        // Google marker default z-index is 1000
        isMarkerActive && "z-[1001] scale-125 opacity-100",
      )}
    >
      {/* NOTE: Pin must be added explicitly as we have an InfoWindow as a child */}
      <div>
        <Pin
          // @ts-expect-error - glyphSrc is a valid prop for the Pin component but not typed
          glyphSrc={place.icon ? new URL(place.icon) : undefined} // TODO: Update this for new Places API
          background="#0f9d58"
          borderColor="#006425"
          glyphColor="#60d98f"
        />
      </div>

      {infoWindowShown && (
        <InfoWindow
          onCloseClick={toggleInfoWindow}
          anchor={marker}
          // headerContent={<h3 className="text-lg font-bold">{place.name}</h3>}
          headerContent={
            <h3 className="text-lg font-bold">{place.displayName.text}</h3>
          }
        >
          <div>
            <p>{place.shortFormattedAddress}</p>
            <p>Rating: {place.rating}</p>
            {priceLevel && <p> Price Level: {priceLevel}</p>}
            {readablePriceRange && <p> Price Range: {readablePriceRange}</p>}
            {/* <p>User Ratings Total: {place.user_ratings_total}</p> */}

            {/* NOTE: Photos are a part of the "pro" Places API and will incur charges */}
            {/* {hasImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={place.name ?? ""}
                height={imageHeight}
                width={imageWidth}
                className={cn(
                  "w-[150px] max-w-full",
                  getAspectRatio(imageWidth, imageHeight),
                )}
              />
            )} */}

            {/* {hasOpeningHours && opening_hours.weekday_text && (
              <p>Weekday Text: {opening_hours.weekday_text}</p>
            )} */}
            {/*
             * open_now is deprecated as of November 2019. Use the isOpen() method from a PlacesService.getDetails() result instead.
             * See https://goo.gle/js-open-now
             */}
            {/* {hasOpeningHours && opening_hours.isOpen && (
              <p>Open Now: {opening_hours.isOpen() ? "Open" : "Closed"}</p>
            )} */}
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};
