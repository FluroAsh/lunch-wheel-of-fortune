import { useMapsLibrary } from "@vis.gl/react-google-maps";

// export type NearbyPlaces = google.maps.places.PlaceResult[];
export type NearbyPlaces = GooglePlace[];

export type MapInstance = google.maps.Map;
export type MouseMapEvent = google.maps.MapMouseEvent;
export type Libraries = Parameters<typeof useMapsLibrary>[0];

export type Coords = { lat: number; lng: number };

// ---- Google Places API Types ---- //
export type RankPreference = "POPULARITY" | "DISTANCE";

export type PriceLevel =
  | "PRICE_LEVEL_UNSPECIFIED"
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE";

export type PriceRange = { currencyCode: string; units: string };

// Refer to: https://developers.google.com/maps/documentation/places/web-service/nearby-search#fieldmask
// For a list of available fields/properties that are available from the Nearby Search response
export type GooglePlace = {
  id: string;
  displayName: { text: string; languageCode: string };
  location: { latitude: number; longitude: number };
  priceLevel?: PriceLevel;
  priceRange?: { startPrice: PriceRange; endPrice: PriceRange };
  rating: number;
  shortFormattedAddress: string;
};
