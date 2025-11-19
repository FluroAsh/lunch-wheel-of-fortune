"use client";

import Link from "next/link";
import React, { type CSSProperties, useEffect } from "react";

import {
  AdvancedMarker,
  Map,
  MapMouseEvent,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";
import { LucideShipWheel, SearchIcon } from "lucide-react";

import { MAP } from "@/lib/constants";
import { cn, filterLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";
import { Coords } from "@/types/google";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { AdvancedMarkerComponent } from "./advanced-marker";
import { Circle } from "./circle";
import { RadiusSlider } from "./radius-slider";

const containerStyle = {
  width: "100%",
  height: "100%",
  color: "#1f1f1f",
} satisfies CSSProperties;

const GoogleMap = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();
  const mapsLoadingState = useApiLoadingStatus();

  const [placeMarkers, setPlaceMarkers] = React.useState<React.ReactNode[]>([]);

  const { radius, searchLocation, setSearchLocation, setActiveMarker } =
    useMapStore();
  const { state: locationState, coords, userLocation } = useGeolocation();

  // Determine which coordinates to search - prefer user location, fallback to default coords
  const currentLocation: Coords = searchLocation ?? coords;

  const { places, isLoading: isPlacesLoading } = useNearbyPlaces();

  // Update markers when places change
  useEffect(() => {
    if (map && !isPlacesLoading && places.length > 0) {
      const markers = places
        .filter(filterLatLng)
        .map((place) => (
          <AdvancedMarkerComponent key={place.id} place={place} />
        ));

      setPlaceMarkers(markers);
    }
  }, [places, map, isPlacesLoading]);

  // Update search coordinates when geolocation succeeds (only if no manual selection)
  useEffect(() => {
    if (map && userLocation && locationState !== "denied") {
      const userCoords = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      map.panTo(userCoords);
      setSearchLocation(userCoords);
    }
  }, [map, userLocation, locationState]);

  const handleLocationUpdate = (event: MapMouseEvent) => {
    if (event.detail.latLng && map) {
      const newLat = event.detail.latLng.lat;
      const newLng = event.detail.latLng.lng;

      map.panTo({ lat: newLat, lng: newLng });
      setSearchLocation({ lat: newLat, lng: newLng });
      setActiveMarker(undefined);
    }
  };

  // Show loading state only while Maps API is loading
  // Map will display with default location if geolocation fails or is still loading
  if (!isMapsAPIReady || mapsLoadingState === "LOADING") {
    return (
      <div
        style={containerStyle}
        className="flex animate-pulse items-center justify-center bg-neutral-600/50"
      >
        <p className="text-neutral-100">
          {locationState === "loading"
            ? "Getting your location..."
            : "Loading map..."}
        </p>
      </div>
    );
  }

  // Only show error if Google Maps API failed to load
  // Geolocation errors are handled gracefully with default location
  if (mapsLoadingState === "FAILED") {
    return (
      <p className="text-red-500">Error: Failed to load Google Maps API</p>
    );
  }

  return (
    <div className="relative flex size-full flex-col overflow-hidden rounded-md border border-neutral-700 lg:overflow-y-auto">
      <div className="relative bg-neutral-800 p-2 lg:p-4">
        <SearchIcon className="absolute top-1/2 left-7 size-4 -translate-y-1/2 stroke-neutral-400 text-neutral-100" />
        <input
          className={cn(
            "w-full rounded-md bg-neutral-900 px-2 py-2 pl-10 text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          type="text"
          placeholder="Where's the food?"
          disabled={true} // TODO: Add Google autocomplete for address search
        />
      </div>

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
        <RadiusSlider />

        {places.length > 0 && (
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
            <Link
              href="/spin"
              className="flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white shadow-lg transition-colors duration-200 hover:bg-emerald-700"
              title="Spin the Wheel for a Lunch Decision"
            >
              <LucideShipWheel className="mr-2 size-5 stroke-white" />
              <span className="font-semibold">Spin the Wheel</span>
            </Link>
          </div>
        )}

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
