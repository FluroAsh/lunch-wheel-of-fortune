"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiIsLoaded, useMap } from "@vis.gl/react-google-maps";

import { METHODS } from "@/lib/constants";
import { API_ROUTE } from "@/lib/urls";
import { useMapStore } from "@/store";
import type { NearbyPlaces } from "@/types/google";

import { useGeolocation } from "./use-geolocation";

const getNearbyPlaces = async (lat: number, lng: number, radius: number) => {
  const res = await fetch(API_ROUTE.nearbyPlaces, {
    method: METHODS.POST,
    body: JSON.stringify({ lat, lng, radius }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const data: NearbyPlaces = await res.json();
  return data;
};

export const useNearbyPlaces = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();

  const { radius, setSelectedPlaceIds } = useMapStore();
  const { coords, state: geoState } = useGeolocation();

  // Ensures we do not make an unnecessary API call if geoLocation is still pending
  const isGeolocationFinished = geoState === "success" || geoState === "denied";

  const { data: places = [], ...rest } = useQuery({
    queryKey: ["nearbyPlaces", coords.lat, coords.lng, radius],
    queryFn: async () => {
      const places = await getNearbyPlaces(coords.lat, coords.lng, radius);
      setSelectedPlaceIds(places.map((p) => p.id));
      return places;
    },
    enabled: isGeolocationFinished && !!map && isMapsAPIReady,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return { places, ...rest };
};
