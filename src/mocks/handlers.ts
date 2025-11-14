import { HttpResponse, delay, http } from "msw";

import { mockPlaces } from "./data";

export const handlers = [
  http.post(
    "https://places.googleapis.com/v1/places:searchNearby",
    async () => {
      await delay(250);
      return HttpResponse.json({
        places: mockPlaces,
      });
    },
  ),
];
