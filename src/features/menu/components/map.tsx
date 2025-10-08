"use client";

import React from "react";
import { useGeolocation } from "../hooks/use-geolocation";
import { GoogleMap as ReactGoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

type TMap = google.maps.Map;

const GoogleMap = () => {
  const [map, setMap] = React.useState<TMap | null>(null);
  const { state, error, userLocation } = useGeolocation();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  console.log("process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const onLoad = React.useCallback((map: TMap) => {
    if (!userLocation) return;

    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds({
      lat: userLocation!.latitude,
      lng: userLocation!.longitude,
    });

    map.fitBounds(bounds);
    setMap(map);
  }, []);

  // const onUnmount = React.useCallback((map: TMap) => {
  //   setMap(null);
  // }, []);

  if (state === "loading" || !isLoaded) {
    return <p>Getting your location...</p>;
  }

  if (state === "error" || !userLocation) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return isLoaded ? (
    <ReactGoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
      zoom={15}
      onLoad={onLoad}
      // onUnmount={onUnmount}
    >
      <Marker position={{ lat: userLocation.latitude, lng: userLocation.longitude }} />
    </ReactGoogleMap>
  ) : (
    <p>Loading...</p>
  );
};

export default React.memo(GoogleMap);
