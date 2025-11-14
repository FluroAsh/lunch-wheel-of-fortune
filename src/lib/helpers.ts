import { GooglePlace } from "@/types/google";

export const getPlacesSearchUrl = ({
  placeName,
  placeId,
}: {
  placeName: string;
  placeId: string;
}) =>
  `https://www.google.com/maps/search/?api=1&query=${placeName}&query_place_id=${placeId}`;
