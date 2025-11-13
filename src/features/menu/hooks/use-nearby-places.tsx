"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiIsLoaded, useMap } from "@vis.gl/react-google-maps";

import { useMapStore } from "@/store";

import { fetchNearbyPlaces } from "../utils";
import { useGeolocation } from "./use-geolocation";

export const useNearbyPlaces = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();

  const { searchLocation: { lat: searchLat, lng: searchLng } = {}, radius } =
    useMapStore();

  // current GPS coords (if enabled), or default location
  const {
    coords: { lat: geoLat, lng: geoLng },
  } = useGeolocation();

  const lat = searchLat ?? geoLat;
  const lng = searchLng ?? geoLng;

  const { data: places = [], ...rest } = useQuery({
    queryKey: ["nearbyPlaces", lat, lng, radius],
    queryFn: () => fetchNearbyPlaces(lat, lng, radius),
    enabled: isMapsAPIReady && !!map && !!lat && !!lng && !!radius,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { places, ...rest };
};
