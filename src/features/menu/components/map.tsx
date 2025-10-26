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
  width: "800px",
  height: "600px",
  maxWidth: "100%",
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
    <>
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
        {/* TODO: Add Google autocomplete for address search (ie when geolocation fails/is disabled) */}
        <div className="absolute top-0 left-0 rounded-br-md p-2 shadow-md backdrop-blur-md">
          <input
            className="rounded-md bg-neutral-400/50 px-2 py-1 text-neutral-800 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            type="text"
            placeholder="Where's the food?"
          />
        </div>

        <RadiusSlider currentLocation={currentLocation} />

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
