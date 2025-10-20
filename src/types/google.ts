import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type NearbyPlaces = google.maps.places.PlaceResult[];
export type MapInstance = google.maps.Map;
export type MouseMapEvent = google.maps.MapMouseEvent;
export type Libraries = Parameters<typeof useMapsLibrary>[0];

export type Coords = { lat: number; lng: number };
