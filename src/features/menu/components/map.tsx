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
import { filterLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";
import { Coords } from "@/types/google";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { AdvancedMarkerComponent } from "./advanced-marker";
import { Circle } from "./circle";

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
    useMapStore();

  const { state, error, coords } = useGeolocation();
  const { searchPlaces, isLoadingPlaces, isFetched } = useNearbyPlaces(map);

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
    // if (true) {
    return (
      <div>
        {/* Search Bar */}
        <div className="my-2 flex h-10.5 w-48 animate-pulse items-center justify-center rounded-md bg-neutral-600/50" />

        {/* Radius Slider */}
        <div className="my-2 flex h-4 w-60 animate-pulse items-center justify-center rounded-full bg-neutral-600/50" />

        {/* Map */}
        <div
          style={containerStyle}
          className="flex animate-pulse items-center justify-center bg-neutral-600/50"
        >
          <p className="text-neutral-100">Getting your location...</p>
        </div>
      </div>
    );
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
    </>
  );
};

export default React.memo(GoogleMap);
