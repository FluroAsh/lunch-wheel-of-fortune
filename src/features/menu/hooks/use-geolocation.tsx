"use client";

import { useCallback, useState } from "react";
import { useEffect } from "react";

import { MAP } from "@/lib/constants";
import { useMapStore } from "@/store";

/** 10 second (10,000ms) idle timeout. */
const IDLE_TIMEOUT = 10000;

export const useGeolocation = (options: PositionOptions = {}) => {
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<
    "ready" | "loading" | "error" | "denied" | "success"
  >("ready");
  const { searchLocation } = useMapStore();

  const getCurrentPosition = useCallback(() => {
    // Check if geolocation is supported and we're in the browser
    if (!navigator.geolocation) {
      setState("error");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setState("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation(coords);
        setState("success");
      },
      (error) => {
        setState(error.PERMISSION_DENIED ? "denied" : "error");
        setError(error.message);
      },
      {
        timeout: IDLE_TIMEOUT,
        maximumAge: 10000,
        enableHighAccuracy: true,
        ...options,
      },
    );
  }, [options]);

  useEffect(() => {
    getCurrentPosition(); // Initial geolocation request
  }, []);

  // Priority: searchLocation > userLocation > defaultLocation
  const getCoords = () => {
    if (searchLocation) {
      return searchLocation;
    }

    if (userLocation) {
      return {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
    }

    return MAP.defaultLocation;
  };

  return {
    state,
    error,
    userLocation,
    coords: getCoords(),
  };
};
