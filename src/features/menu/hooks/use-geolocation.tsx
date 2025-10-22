"use client";

import { useCallback, useState } from "react";
import { useEffect } from "react";

const IDLE_TIMEOUT = 10000;

export const useGeolocation = (options: PositionOptions = {}) => {
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">(
    "idle",
  );

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
        setState("error");
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

  // Initial geolocation request
  useEffect(() => {
    getCurrentPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset state after user is considered idle
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (state !== "loading") {
      timeout = setTimeout(() => {
        setState("idle");
        setError(null);
      }, IDLE_TIMEOUT);
    }

    return () => clearTimeout(timeout);
  }, [state]);

  return {
    state,
    error,
    userLocation,
    coords: {
      lat: userLocation?.latitude || 0,
      lng: userLocation?.longitude || 0,
    },
    retry: getCurrentPosition,
  };
};
