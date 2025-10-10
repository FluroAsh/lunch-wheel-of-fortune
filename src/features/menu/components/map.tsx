"use client";

import React, { useEffect } from "react";
import { useGeolocation } from "../hooks/use-geolocation";
import {
  GoogleMap as ReactGoogleMaps,
  useJsApiLoader,
  Marker,
  Libraries,
} from "@react-google-maps/api";
import { Coords, MouseMapEvent, MapInstance } from "@/types/google";
import { usePlacesStore } from "@/app/store";
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

  const { places, setPlaces } = usePlacesStore();
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
    error: hasPlacesError,
    isFetched,
  } = useNearbyPlaces(map);

  const currentLocation: Coords = selectedLocation ?? coords;

  useEffect(() => {
    if (map && !isFetched) {
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

  if (state === "loading" || !isMapsAPIReady) {
    return <p>Getting your location...</p>;
  }

  if (state === "error" || mapsAPILoadError || hasPlacesError) {
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
        className="p-2 my-2 rounded-md border border-neutral-300"
        type="text"
        placeholder="Search WIP"
      />

      <ReactGoogleMaps
        mapContainerStyle={containerStyle}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        zoom={15}
        onLoad={onLoad}
        onClick={onMapClick}
        options={{ disableDefaultUI: true }}
      >
        <Marker
          position={{
            lat: currentLocation.lat,
            lng: currentLocation.lng,
          }}
        />
      </ReactGoogleMaps>

      {/* TODO: These should be selectable, and saved in a list for use in the spinning wheel */}
      {isLoadingPlaces ? (
        <MapSkeleton />
      ) : places && places.length > 0 ? (
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border space-y-2 border-neutral-300">
          <p className="font-bold ">Places nearby that are currently open</p>
          <ul>
            {places.map((place) => (
              <li key={place.place_id}>
                <a
                  className="block hover:underline hover:text-blue-500 truncate w-fit"
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
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] rounded-md border border-neutral-300 my-2">
          <div className="text-neutral-100">No places found</div>
          <button
            className="p-2 rounded-md border border-blue-500 bg-blue-500 font-bold text-blue-100"
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
