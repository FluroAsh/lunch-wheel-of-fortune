"use client";

import { useRef, useState } from "react";

import {
  getCachedPlaces,
  invalidateCacheForCoordinates,
  setCachedPlaces,
} from "@/lib/cache";
import { useMapStore } from "@/store";
import { MapInstance, NearbyPlaces } from "@/types/google";

export const useNearbyPlaces = (map: MapInstance | null) => {
  const { isLoadingPlaces, setIsLoadingPlaces } = useMapStore();
  const [error, setError] = useState<string | null>(null);
  const isFetched = useRef<boolean>(false);

  const searchPlaces = async (lat: number, lng: number) => {
    try {
      if (!map) return [];

      // Get radius immediately to avoid render race condition
      const { radius } = useMapStore.getState();

      // Invalidate cache entries for same coordinates but different radius
      const isRemoved = invalidateCacheForCoordinates(lat, lng, radius);

      if (isRemoved) {
        console.debug(
          "[Cache]: Invalidated cache entries for same coordinates but different radius",
        );
      }

      // Cache-first Loading
      const cachedResult = getCachedPlaces(lat, lng, radius);
      if (cachedResult) {
        console.debug("[Cache]: Cache hit — returning cached result");
        return cachedResult;
      }

      console.debug("[Cache]: Cache miss — fetching from API");
      const service = new google.maps.places.PlacesService(map);
      setIsLoadingPlaces(true);
      setError(null);

      const result = await new Promise<NearbyPlaces>((resolve, reject) =>
        service.nearbySearch(
          {
            type: "restaurant",
            keyword: "restaraunts and cafes near me", // TODO: Make this dynamic, eg. with user preferences
            radius,
            openNow: true,
            rankBy: google.maps.places.RankBy.PROMINENCE,
            location: { lat, lng },
          },
          (results, status) => {
            if (results && status === "OK") {
              resolve(results);
            } else {
              reject(new Error(`Places search failed with status: ${status}`));
            }
          },
        ),
      );

      setCachedPlaces(lat, lng, radius, result); // Store result in cache
      console.debug("[Cache]: Cached places search result");

      setIsLoadingPlaces(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Places search failed");
      return [];
    } finally {
      isFetched.current = true;
      setIsLoadingPlaces(false);
    }
  };

  return { isLoadingPlaces, error, searchPlaces, isFetched: isFetched.current };
};
