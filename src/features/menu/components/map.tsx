"use client";

import React, { CSSProperties, useEffect } from "react";

import {
  AdvancedMarker,
  Map,
  MapMouseEvent,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";
import { SearchIcon } from "lucide-react";

import { MAP } from "@/lib/constants";
import { filterLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";
import { Coords } from "@/types/google";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { AdvancedMarkerComponent } from "./advanced-marker";
import { Circle } from "./circle";
import { RadiusSlider } from "./radius-slider";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flex: "1 1 0%",
  color: "#1f1f1f",
} satisfies CSSProperties;

const GoogleMap = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();
  const status = useApiLoadingStatus();

  const [placeMarkers, setPlaceMarkers] = React.useState<React.ReactNode[]>([]);
  const [selectedLocation, setSelectedLocation] =
    React.useState<Coords | null>();

  const { places, setPlaces, radius, clearExpiredCache } = useMapStore();

  const { state, error, coords } = useGeolocation();
  const { searchPlaces, isLoadingPlaces, isFetched } = useNearbyPlaces(map);

  const currentLocation: Coords = selectedLocation ?? coords;

  useEffect(() => {
    if (map && isFetched && !isLoadingPlaces && places.length > 0) {
      const markers = places
        .filter(filterLatLng)
        .map((place) => (
          <AdvancedMarkerComponent key={place.id} place={place} />
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

  const handleLocationUpdate = (event: MapMouseEvent) => {
    if (event.detail.latLng && map) {
      const newLat = event.detail.latLng.lat;
      const newLng = event.detail.latLng.lng;

      map.panTo({ lat: newLat, lng: newLng });
      setSelectedLocation({ lat: newLat, lng: newLng });
      searchPlaces(newLat, newLng).then((places) => setPlaces(places));
    }
  };

  if (state === "loading" || !isMapsAPIReady || !currentLocation) {
    return (
      <div
        style={containerStyle}
        className="flex animate-pulse items-center justify-center bg-neutral-600/50"
      >
        <p className="text-neutral-100">Getting your location...</p>
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
    <div className="relative flex size-full flex-col overflow-hidden rounded-md border-2 border-neutral-600 lg:overflow-y-auto">
      {/* TODO: Add Google autocomplete for address search (ie when geolocation fails/is disabled) */}
      <div className="relative bg-neutral-800 p-4">
        <SearchIcon className="absolute top-1/2 left-7 size-4 -translate-y-1/2 stroke-neutral-400 text-neutral-100" />
        <input
          className="w-full rounded-md bg-neutral-900 px-2 py-2 pl-10 text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          type="text"
          placeholder="Where's the food?"
        />
      </div>

      <RadiusSlider currentLocation={currentLocation} />

      <Map
        key="google-map"
        mapId={MAP.id}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        defaultCenter={currentLocation}
        style={containerStyle}
        defaultZoom={15}
        onClick={handleLocationUpdate}
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
    </div>
  );
};

export default React.memo(GoogleMap);
