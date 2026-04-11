const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1";

export const GOOGLE = {
  POST: {
    searchNearby: `${GOOGLE_PLACES_BASE_URL}/places:searchNearby`,
    autocomplete: `${GOOGLE_PLACES_BASE_URL}/places:autocomplete`,
  },
  GET: {
    placeDetails: `${GOOGLE_PLACES_BASE_URL}/places`,
  },
} as const;

type APIRouteUrl = `/api/${string}`;

export const API_ROUTE: Record<string, APIRouteUrl> = {
  nearbyPlaces: "/api/places/nearby",
};
