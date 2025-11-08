import { METHODS } from "@/lib/constants";
import { GOOGLE } from "@/lib/urls";
import { NearbyPlaces, RankPreference } from "@/types/google";

import { EXCLUDED_NON_FOOD_TYPES, FOOD_AND_DRINK_TYPES } from "../constants";

// Refer to: https://developers.google.com/maps/billing-and-pricing/pricing#places-pricing
// For a list of pricing tiers and their respective free tier caps
// Essentials 10k p/ month, pro: 5k, enterprise, 1k
const fieldMask = [
  // Essentials — (10k requests/month)
  "displayName",
  "location",
  "shortFormattedAddress",
  // Pro — (5k requests/month)
  "id",
  // Enterprise — (1k requests/month)
  "currentOpeningHours.openNow",
  "priceLevel",
  "priceRange",
  "rating",
]
  .map((field) => `places.${field}`)
  .join(",");

type NearbyPlacesResponse = { places: NearbyPlaces };

/** Fetches nearby places from the (new) Google Places API. */
export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number,
  types = FOOD_AND_DRINK_TYPES,
) => {
  try {
    const response = await fetch(GOOGLE.POST.searchNearby, {
      method: METHODS.POST,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask": fieldMask, // https://developers.google.com/maps/documentation/places/web-service/nearby-search#fieldmask
      },
      body: JSON.stringify({
        includedTypes: types,
        excludedTypes: EXCLUDED_NON_FOOD_TYPES,
        rankPreference: "POPULARITY" satisfies RankPreference,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
        openNow: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nearby places: ${response.statusText}`);
    }

    const { places = [] }: NearbyPlacesResponse = await response.json();

    // No intention to currently return places that are not open
    // But might add some better UI/UX for this in the future.
    return places.filter((place) => !!place.currentOpeningHours?.openNow);
  } catch (error) {
    console.error("[API]: Error fetching nearby places", error);
    throw error;
  }
};
