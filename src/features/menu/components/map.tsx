"use client";

import React from "react";
import { useGeolocation } from "../hooks/use-geolocation";
import { GoogleMap as ReactGoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "800px",
  height: "800px",
  maxWidth: "100%",
};

type TMap = google.maps.Map;
type MouseMapEvent = google.maps.MapMouseEvent;

const GoogleMap = () => {
  const [map, setMap] = React.useState<TMap | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>();

  const { state, error, userLocation } = useGeolocation();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const onLoad = React.useCallback(
    (map: TMap) => {
      if (!userLocation) return;

      // Pan to the user's location, so we don't have to use map.fitBounds()
      map.panTo({
        lat: userLocation!.latitude,
        lng: userLocation!.longitude,
      });

      setMap(map);
    },
    [userLocation]
  );

  const onMapClick = React.useCallback(
    (event: MouseMapEvent) => {
      if (event.latLng && map) {
        setSelectedLocation({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        });

        map.panTo({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        });
      }
    },
    [map]
  );

  if (state === "loading" || !isLoaded) {
    return <p>Getting your location...</p>;
  }

  if (state === "error" || !userLocation) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <ReactGoogleMap
      mapContainerStyle={containerStyle}
      mapTypeId={google.maps.MapTypeId.ROADMAP}
      zoom={15}
      onLoad={onLoad}
      onClick={onMapClick}
      options={{
        disableDefaultUI: true,
      }}
    >
      <Marker
        position={{
          lat: selectedLocation?.lat ?? userLocation.latitude,
          lng: selectedLocation?.lng ?? userLocation.longitude,
        }}
      />
    </ReactGoogleMap>
  );
};

export default React.memo(GoogleMap);
