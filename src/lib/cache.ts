import { NearbyPlaces } from "@/types/google";

import { CACHE } from "./constants";

const CACHE_PREFIX = "places_";
const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: NearbyPlaces;
  timestamp: number;
  radius: number;
}

/** Rounds coordinates to 2 decimal places (~500m precision) */
const roundCoordinate = (coord: number): number => {
  return Math.round(coord * 100) / 100;
};

/** Generates a cache key from coordinates and radius */
export const generateCacheKey = (
  lat: number,
  lng: number,
  radius: number,
): string => {
  const roundedLat = roundCoordinate(lat);
  const roundedLng = roundCoordinate(lng);
  return `${CACHE_PREFIX}${roundedLat}_${roundedLng}_${radius}`;
};

/** Retrieves cached data if it exists and is not expired */
export const getCachedPlaces = (
  lat: number,
  lng: number,
  radius: number,
): NearbyPlaces | null => {
  try {
    const key = generateCacheKey(lat, lng, radius);
    const cached = localStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(cached);
    const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRATION_MS;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("[Cache]: Error reading from cache:", error);
    return null;
  }
};

/** Stores places data in cache with current timestamp */
export const setCachedPlaces = (
  lat: number,
  lng: number,
  radius: number,
  data: NearbyPlaces,
) => {
  try {
    const key = generateCacheKey(lat, lng, radius);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      radius,
    };

    entry.data.forEach((place) => {
      // Do not cache deprecated properties — only open places will be cached, so it can be safely removed
      delete place.opening_hours?.open_now;
    });

    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error("[Cache]: Error writing to cache:", error);
  }
};

/** Clears all expired cache entries */
export const clearExpiredCache = (): void => {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);

        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRATION_MS;

          if (isExpired) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[Cache]: Error clearing expired cache:", error);
  }
};

/** Clears all cached places data */
export const clearAllCache = (): void => {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[Cache]: Error clearing all cache:", error);
  }
};

/** Invalidates cache entries for the same coordinates but different radius values */
export const invalidateCacheForCoordinates = (
  lat: number,
  lng: number,
  currentRadius: number,
) => {
  try {
    const roundedLat = roundCoordinate(lat);
    const roundedLng = roundCoordinate(lng);
    const coordinatePrefix = `${CACHE_PREFIX}${roundedLat}_${roundedLng}_`;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const cachedRadius = parseInt(key?.split("_").pop() ?? "0");

      // Only invalidate cache entries if the radius difference is greater than the minimum threshold
      const radiusDiff = Math.max(0, Math.abs(cachedRadius - currentRadius));

      if (key?.startsWith(coordinatePrefix)) {
        console.log(`[cache] — MATCH — radiusDiff ${key}`, {
          radiusDiff,
          cachedRadius,
          currentRadius,
        });
      }

      if (
        key &&
        key.startsWith(coordinatePrefix) &&
        radiusDiff >= CACHE.radiusThreshold
      ) {
        keysToRemove.push(key!);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.debug(
        `[Cache]: Invalidated cache entry for different radius: ${key}`,
      );
    });

    return keysToRemove.length > 0;
  } catch (error) {
    console.error("[Cache]: Error invalidating cache for coordinates:", error);
  }
};
