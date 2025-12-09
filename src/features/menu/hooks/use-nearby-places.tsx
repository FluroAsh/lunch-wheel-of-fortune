"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiIsLoaded, useMap } from "@vis.gl/react-google-maps";

import { useMapStore } from "@/store";

import { fetchNearbyPlaces } from "../../../lib/api";
import { useGeolocation } from "./use-geolocation";

export const useNearbyPlaces = () => {
  const map = useMap();
  const isMapsAPIReady = useApiIsLoaded();

  const { radius, setSelectedPlaceIds } = useMapStore();
  const { coords, state: geoState } = useGeolocation();

  // Ensure we do not make an unnecessary API call if location is still pending
  const isGeolocationFinished = geoState === "success" || geoState === "denied";

  const { data: places = [], ...rest } = useQuery({
    queryKey: ["nearbyPlaces", coords.lat, coords.lng, radius],
    queryFn: async () => {
      const places = await fetchNearbyPlaces(coords.lat, coords.lng, radius);
      setSelectedPlaceIds(places.map((p) => p.id));
      return places;
    },
    enabled: isGeolocationFinished && !!map && isMapsAPIReady,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return { places, ...rest };
};
