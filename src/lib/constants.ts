export const CACHE = {
  radiusThreshold: 500, // 500m
} as const;

export const MAP = {
  id: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "",
  defaultRadius: 1000, // 1000m
  searchDebounceDelay: 1000, // 1000ms
} as const;
