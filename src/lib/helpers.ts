import { GooglePlace } from "@/types/google";

export const getPlacesSearchUrl = (place: GooglePlace) =>
  `https://www.google.com/maps/search/?api=1&query=${place.displayName.text}&query_place_id=${place.id}`;
