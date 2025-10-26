import { useState } from "react";

import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

import { cn, getAspectRatio, getLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";

export const AdvancedMarkerComponent = ({
  place,
}: {
  place: google.maps.places.PlaceResult;
}) => {
  const { activeMarker } = useMapStore();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const toggleInfoWindow = () => setInfoWindowShown((isShown) => !isShown);

  const { lat, lng } = getLatLng(place);

  if (!lat || !lng) {
    return null;
  }

  const { opening_hours, photos } = place;
  const hasOpeningHours = opening_hours !== undefined;

  const mainPhoto = photos?.[0];
  const imageUrl = mainPhoto?.getUrl?.();
  const imageWidth = mainPhoto?.width;
  const imageHeight = mainPhoto?.height;

  const hasImage = !!(imageUrl && imageWidth && imageHeight);
  const isMarkerActive = activeMarker === place.place_id;

  return (
    <AdvancedMarker
      zIndex={1000}
      ref={markerRef}
      position={{ lat, lng }}
      onClick={toggleInfoWindow}
      className={cn(
        "transition-all duration-200",
        isMarkerActive && "scale-150",
      )}
    >
      {/* NOTE: Pin must be added explicitly as we have an InfoWindow as a child */}
      <div>
        <Pin
          // @ts-expect-error - glyphSrc is a valid prop for the Pin component but not typed
          glyphSrc={place.icon ? new URL(place.icon) : undefined}
          background="#0f9d58"
          borderColor="#006425"
          glyphColor="#60d98f"
        />
      </div>

      {infoWindowShown && (
        <InfoWindow
          onCloseClick={toggleInfoWindow}
          anchor={marker}
          headerContent={<h3 className="text-lg font-bold">{place.name}</h3>}
        >
          <div>
            <p>{place.formatted_address}</p>
            <p>Rating: {place.rating}</p>
            <p>Price Level: {place.price_level}</p>
            <p>User Ratings Total: {place.user_ratings_total}</p>

            {hasImage && (
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
            )}

            {/* {hasOpeningHours && opening_hours.weekday_text && (
              <p>Weekday Text: {opening_hours.weekday_text}</p>
            )} */}
            {/*
             * open_now is deprecated as of November 2019. Use the isOpen() method from a PlacesService.getDetails() result instead.
             * See https://goo.gle/js-open-now
             */}
            {hasOpeningHours && opening_hours.isOpen && (
              <p>Open Now: {opening_hours.isOpen() ? "Open" : "Closed"}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};
