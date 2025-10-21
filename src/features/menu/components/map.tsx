"use client";

import React, { useEffect, useMemo } from "react";

import {
  AdvancedMarker,
  Map,
  MapMouseEvent,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";
import { debounce } from "radash";

import { MAP } from "@/lib/constants";
import { cn, filterLatLng } from "@/lib/utils";
import { usePlacesStore } from "@/store";
import { Coords } from "@/types/google";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { getPriceLevel, getStarRating } from "../utils/map";
import { AdvancedMarkerComponent } from "./advanced-marker";
import { Circle } from "./circle";
import { MapSkeleton } from "./map.skeleton";

const containerStyle = {
  width: "800px",
  height: "600px",
  maxWidth: "100%",
  color: "#1f1f1f",
};

const GoogleMap = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();
  const status = useApiLoadingStatus();

  const [placeMarkers, setPlaceMarkers] = React.useState<React.ReactNode[]>([]);
  const [selectedLocation, setSelectedLocation] =
    React.useState<Coords | null>();

  const { places, setPlaces, radius, setRadius, clearExpiredCache } =
    usePlacesStore();

  const { state, error, coords, retry } = useGeolocation();

  const {
    searchPlaces,
    isLoading: isLoadingPlaces,
    isFetched,
  } = useNearbyPlaces(map);

  const currentLocation: Coords = selectedLocation ?? coords;

  useEffect(() => {
    if (map && isFetched && !isLoadingPlaces && places.length > 0) {
      const markers = places
        .filter(filterLatLng)
        .map((place) => (
          <AdvancedMarkerComponent key={place.place_id} place={place} />
        ));

      setPlaceMarkers(markers);
    }
  }, [places, map, isFetched, isLoadingPlaces]);

  // Clear expired cache entries on component mount
  useEffect(() => {
    clearExpiredCache();
  }, [clearExpiredCache]);

  useEffect(() => {
    // FIXME: This is being called twice
    if (map && !isFetched) {
      searchPlaces(coords.lat, coords.lng).then((places) => setPlaces(places));
    }
  }, [map, coords, searchPlaces, setPlaces, isFetched]);

  const onMapClick = (event: MapMouseEvent) => {
    if (event.detail.latLng && map) {
      const newLat = event.detail.latLng.lat;
      const newLng = event.detail.latLng.lng;

      map.panTo({ lat: newLat, lng: newLng });
      setSelectedLocation({ lat: newLat, lng: newLng });
      searchPlaces(newLat, newLng).then((places) => setPlaces(places));
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce({ delay: MAP.searchDebounceDelay }, () => {
        searchPlaces(currentLocation.lat, currentLocation.lng).then((places) =>
          setPlaces(places),
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocation.lat, currentLocation.lng],
  );

  if (state === "loading" || !isMapsAPIReady || !currentLocation) {
    return <p>Getting your location...</p>;
  }

  if (state === "error" || status === "FAILED") {
    return (
      <p className="text-red-500">
        Error:{" "}
        {error || status === "FAILED" ? "Failed to load Google Maps API" : ""}
      </p>
    );
  }

  return (
    <>
      {/* TODO: Add Google autocomplete for address search (ie when geolocation fails/is disabled) */}
      <input
        className="my-2 rounded-md border border-neutral-300 p-2"
        type="text"
        placeholder="Search WIP"
      />

      <div className="flex items-center gap-2">
        <input
          id="radius"
          name="radius"
          type="range"
          min={500}
          max={5000}
          step={250}
          value={radius}
          onChange={(e) => {
            setRadius(parseInt(e.target.value));
            debouncedSearch();
          }}
        />
        <label htmlFor="radius">{radius} meters</label>
      </div>

      <Map
        key="google-map"
        mapId={MAP.id}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        defaultCenter={currentLocation}
        style={containerStyle}
        defaultZoom={15}
        onClick={onMapClick}
        disableDefaultUI
      >
        <AdvancedMarker
          key="current-location-marker"
          position={{
            lat: currentLocation.lat,
            lng: currentLocation.lng,
          }}
        />

        <Circle
          key="radius-circle"
          center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
          radius={radius}
          strokeColor="#1b99ff"
          strokeOpacity={0.5}
          fillColor="#1b99ff"
          fillOpacity={0.1}
          clickable={false}
        />

        {placeMarkers.map((marker) => marker)}
      </Map>

      {/* TODO: These should be selectable, and saved in a list for use in the spinning wheel */}
      {isLoadingPlaces ? (
        <MapSkeleton />
      ) : places && places.length > 0 ? (
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
      )}
    </>
  );
};

export default React.memo(GoogleMap);
