import { PriceLevel } from "@/types/google";

export const CACHE = {
  radiusThreshold: 500, // 500m
} as const;

export const MAP = {
  id: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "",
  defaultRadius: 1000, // 1000m
  searchDebounceDelay: 1000, // 1000ms
} as const;

export const METHODS = {
  POST: "POST",
  GET: "GET",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

export const PRICE_LEVELS: Record<PriceLevel, number> = {
  PRICE_LEVEL_UNSPECIFIED: 0,
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 2,
  PRICE_LEVEL_MODERATE: 3,
  PRICE_LEVEL_EXPENSIVE: 4,
  PRICE_LEVEL_VERY_EXPENSIVE: 5,
} as const;
