"use client";

import React from "react";
import { useGeolocation } from "../hooks/use-geolocation";
import {
  GoogleMap as ReactGoogleMaps,
  useJsApiLoader,
  Marker,
  Libraries,
} from "@react-google-maps/api";

const containerStyle = {
  width: "800px",
  height: "600px",
  maxWidth: "100%",
};

type TMap = google.maps.Map;
type NearbyPlaces = google.maps.places.PlaceResult[];

type MouseMapEvent = google.maps.MapMouseEvent;

type Coords = { lat: number; lng: number };

// Must be static to prevent script loader reloading
const libraries: Libraries = ["places"];

const GoogleMap = () => {
  const [map, setMap] = React.useState<TMap | null>(null);
  const [selectedLocation, setSelectedLocation] =
    React.useState<Coords | null>();
  const [nearbyPlaces, setNearbyPlaces] = React.useState<NearbyPlaces | null>(
    null
  );

  const { state, error, userLocation, coords } = useGeolocation();
  const currentLocation: Coords = selectedLocation ?? coords;

  const { isLoaded: isMapsAPIReady, loadError: mapsAPILoadError } =
    useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      libraries,
    });

  const searchNearbyPlaces = (map: TMap, lat: number, lng: number) => {
    if (!map || !userLocation) return;

    const service = new google.maps.places.PlacesService(map);

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
      (results) => {
        if (!results) {
          console.warn("[Google Maps API]: No results found");
          return;
        }

        setNearbyPlaces(results);
      }
    );
  };

  const onLoad = (map: TMap) => {
    // Pan to the user's location, so we don't have to use map.fitBounds()
    map.panTo({ lat: coords.lat, lng: coords.lng });

    setMap(map);
    console.log("onload", { lat: coords.lat, lng: coords.lng });
    searchNearbyPlaces(map, coords.lat, coords.lng);
  };

  const onMapClick = (event: MouseMapEvent) => {
    if (event.latLng && map) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();

      searchNearbyPlaces(map, newLat, newLng);
      setSelectedLocation({ lat: newLat, lng: newLng });
      map.panTo({ lat: newLat, lng: newLng });
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

      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border border-neutral-300">
          {nearbyPlaces.map((place) => (
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
      )}
    </>
  );
};

export default React.memo(GoogleMap);
