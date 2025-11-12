import { HttpResponse, http } from "msw";

import { mockPlaces } from "./data";

export const handlers = [
  // Mock Google Places API: searchNearby endpoint
  http.post("https://places.googleapis.com/v1/places:searchNearby", () => {
    return HttpResponse.json({
      places: mockPlaces,
    });
  }),
];
