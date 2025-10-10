"use client";

import React from "react";
import { useGeolocation } from "../hooks/use-geolocation";
import {
  GoogleMap as ReactGoogleMaps,
  useJsApiLoader,
  Marker,
  Libraries,
} from "@react-google-maps/api";
import {
  Coords,
  MouseMapEvent,
  MapInstance,
  NearbyPlaces,
} from "@/types/google";
import { usePlaces } from "@/app/store";

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
  const [loading, setLoading] = React.useState(false);

  const { places, setPlaces } = usePlaces();
  const { state, error, userLocation, coords, retry } = useGeolocation();

  const { isLoaded: isMapsAPIReady, loadError: mapsAPILoadError } =
    useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      libraries,
    });

  const currentLocation: Coords = selectedLocation ?? coords;

  const searchNearbyPlaces = (
    map: MapInstance,
    lat: number,
    lng: number
  ): Promise<NearbyPlaces> => {
    if (!map || !userLocation) return Promise.resolve([]);

    const service = new google.maps.places.PlacesService(map);
    setLoading(true);

    return new Promise((r) =>
      service.nearbySearch(
        {
          type: "restaurant",
          keyword: "restaraunts and cafes near me", // TODO: Make this dynamic, eg. with user preferences
          radius: 1000,
          openNow: true,
          rankBy: google.maps.places.RankBy.PROMINENCE,
          location: {
            lat: lat || currentLocation.lat,
            lng: lng || currentLocation.lng,
          },
        },
        (results, status) => {
          if (!results) {
            console.warn("[Google Maps API]: No results found");
            return;
          }

          console.log("status", status);
          r(results);
        }
      )
    );
  };

  const onLoad = (map: MapInstance) => {
    // Pan to the user's location, so we don't have to use map.fitBounds()
    map.panTo({ lat: coords.lat, lng: coords.lng });

    searchNearbyPlaces(map, coords.lat, coords.lng)
      .then((results) => setPlaces(results))
      .finally(() => setLoading(false));

    setMap(map);
  };

  const onMapClick = (event: MouseMapEvent) => {
    if (event.latLng && map) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();

      map.panTo({ lat: newLat, lng: newLng });
      setSelectedLocation({ lat: newLat, lng: newLng });

      searchNearbyPlaces(map, newLat, newLng)
        .then((results) => setPlaces(results))
        .finally(() => setLoading(false));
    }
  };

  if (state === "loading" || !isMapsAPIReady) {
    return <p>Getting your location...</p>;
  }

  if (state === "error" || !userLocation || mapsAPILoadError) {
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
      {loading ? (
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border border-neutral-300">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              className="h-4 bg-neutral-700/50 my-2 rounded-md w-[300px] animate-pulse"
              key={index}
            />
          ))}
        </div>
      ) : places && places.length > 0 ? (
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border border-neutral-300">
          {places.map((place) => (
            <a
              className="block hover:underline hover:text-blue-500 truncate w-fit"
              href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
              key={place.place_id}
              target="_blank"
            >
              {place.name}
            </a>
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border border-neutral-300">
          <div className="text-neutral-100">No places found</div>
          <button className="text-neutral-100" onClick={retry}>
            Retry
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(GoogleMap);
