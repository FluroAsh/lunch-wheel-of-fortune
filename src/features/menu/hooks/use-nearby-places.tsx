"use client";

import { useRef, useState } from "react";

import { useMapStore } from "@/store";
import { MapInstance } from "@/types/google";

import { fetchNearbyPlaces } from "../utils";

export const useNearbyPlaces = (map: MapInstance | null) => {
  const { isLoadingPlaces, setIsLoadingPlaces } = useMapStore();
  const [error, setError] = useState<string | null>(null);
  const isFetched = useRef<boolean>(false);

  const searchPlaces = async (lat: number, lng: number) => {
    try {
      if (!map || isLoadingPlaces) return [];

      // Get radius immediately to avoid render race condition
      const { radius } = useMapStore.getState();

      setIsLoadingPlaces(true);
      setError(null);

      const result = await fetchNearbyPlaces(lat, lng, radius);

      console.log("[API]: Nearby places result", result);

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
