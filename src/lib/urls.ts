export const GOOGLE = {
  POST: {
    searchNearby: "https://places.googleapis.com/v1/places:searchNearby",
    autocomplete: "https://places.googleapis.com/v1/places:autocomplete",
  },
  GET: {
    placeDetails: "https://places.googleapis.com/v1/places",
  },
} as const;
