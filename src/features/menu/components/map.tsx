"use client";

import React, { type CSSProperties, useEffect } from "react";

import {
  AdvancedMarker,
  Map,
  MapMouseEvent,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";
import { useMedia } from "react-use";

import { MAP, MEDIA_QUERIES } from "@/lib/constants";
import { cn, filterLatLng } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useGeolocation } from "../hooks/use-geolocation";
import { useNearbyPlaces } from "../hooks/use-nearby-places";
import { AutocompleteAddressInput } from "./address-input";
import { AdvancedMarkerComponent } from "./advanced-marker";
import { Circle } from "./circle";
import { RadiusSlider } from "./radius-slider";
import { WheelSpinButton } from "./wheel-spin-button";

const containerStyle = {
  width: "100%",
  height: "100%",
  color: "#1f1f1f",
} satisfies CSSProperties;

const GoogleMap = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();
  const mapsLoadingState = useApiLoadingStatus();

  const isDesktop = useMedia(MEDIA_QUERIES.DESKTOP, false);

  const [placeMarkers, setPlaceMarkers] = React.useState<React.ReactNode[]>([]);

  const { radius, searchLocation, setSearchLocation, setActiveMarker } =
    useMapStore();
  const { state: locationState, coords, userLocation } = useGeolocation();
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
    if (map && userLocation && locationState !== "denied" && !searchLocation) {
      const userCoords = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      map.panTo(userCoords);
      setSearchLocation(userCoords);
    }
  }, [map, userLocation, locationState, searchLocation]);

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
      <AutocompleteAddressInput isLoading={isPlacesLoading} />

      <Map
        key="google-map"
        mapId={MAP.id}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        defaultCenter={coords}
        style={containerStyle}
        defaultZoom={15}
        onClick={handleLocationUpdate}
        disableDefaultUI
      >
        <RadiusSlider />

        {places.length > 0 && isDesktop && (
          <WheelSpinButton absolute isLoading={isPlacesLoading} />
        )}

        <AdvancedMarker
          key="current-location-marker"
          position={{
            lat: coords.lat,
            lng: coords.lng,
          }}
        />

        <Circle
          key="radius-circle"
          center={{ lat: coords.lat, lng: coords.lng }}
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
