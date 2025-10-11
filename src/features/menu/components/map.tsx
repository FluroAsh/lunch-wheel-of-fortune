"use client";

import React, { useEffect, useMemo } from "react";

import {
  Circle,
  Libraries,
  Marker,
  GoogleMap as ReactGoogleMaps,
  useJsApiLoader,
} from "@react-google-maps/api";
import { debounce } from "radash";

import { usePlacesStore } from "@/app/store";
import { Coords, MapInstance, MouseMapEvent } from "@/types/google";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { MapSkeleton } from "./map.skeleton";

const containerStyle = {
  width: "800px",
  height: "600px",
  maxWidth: "100%",
};

const libraries: Libraries = ["places"]; // Must be static to prevent script loader reloading

const GoogleMap = () => {
  const [map, setMap] = React.useState<MapInstance | null>(null);
  const [selectedLocation, setSelectedLocation] =
    React.useState<Coords | null>();

  const { places, setPlaces, radius, setRadius, clearExpiredCache } =
    usePlacesStore();
  const { state, error, coords, retry } = useGeolocation();

  const { isLoaded: isMapsAPIReady, loadError: mapsAPILoadError } =
    useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      libraries,
    });

  const {
    searchPlaces,
    isLoading: isLoadingPlaces,
    isFetched,
  } = useNearbyPlaces(map);

  const currentLocation: Coords = selectedLocation ?? coords;

  // Clear expired cache entries on component mount
  useEffect(() => {
    clearExpiredCache();
  }, [clearExpiredCache]);

  useEffect(() => {
    // FIXME: This is being called twice
    if (map && !isFetched) {
      console.log("searchPlaces");
      searchPlaces(coords.lat, coords.lng).then((places) => setPlaces(places));
    }
  }, [map, coords, searchPlaces, setPlaces, isFetched]);

  const onLoad = (map: MapInstance) => {
    // Pan to the user's location, so we don't have to use map.fitBounds()
    map.panTo({ lat: coords.lat, lng: coords.lng });
    setMap(map);
  };

  const onMapClick = (event: MouseMapEvent) => {
    if (event.latLng && map) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();

      searchPlaces(newLat, newLng).then((places) => setPlaces(places));
      map.panTo({ lat: newLat, lng: newLng });
      setSelectedLocation({ lat: newLat, lng: newLng });
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce({ delay: 500 }, () => {
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

  if (state === "error" || mapsAPILoadError) {
    return (
      <p className="text-red-500">
        Error: {error || mapsAPILoadError?.message}
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
          type="range"
          min={500}
          max={5000}
          step={200}
          value={radius}
          onChange={(e) => {
            setRadius(parseInt(e.target.value));
            debouncedSearch();
          }}
        />
        <span>{radius} meters</span>
      </div>

      <ReactGoogleMaps
        mapContainerStyle={containerStyle}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        zoom={15}
        onLoad={onLoad}
        onClick={onMapClick}
        options={{ disableDefaultUI: true }}
      >
        <Circle
          key={`circle-${currentLocation.lat}-${currentLocation.lng}`}
          center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
          radius={radius}
          options={{
            fillColor: "#000",
            fillOpacity: 0.1,
            strokeColor: "#1f1f1f50",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: false,
          }}
        />
        <Marker
          animation={google.maps.Animation.DROP}
          position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
        />
      </ReactGoogleMaps>

      {/* TODO: These should be selectable, and saved in a list for use in the spinning wheel */}
      {isLoadingPlaces ? (
        <MapSkeleton />
      ) : places && places.length > 0 ? (
        <div className="my-2 max-w-[800px] space-y-2 overflow-y-auto rounded-md border border-neutral-300 bg-neutral-800/50 p-2">
          <p className="font-bold">Places nearby that are currently open</p>
          <ul>
            {places.map((place) => (
              <li key={place.place_id}>
                <a
                  className="block w-fit truncate hover:text-blue-500 hover:underline"
                  href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                  target="_blank"
                >
                  {place.name}
                </a>
              </li>
            ))}
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
