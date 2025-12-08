import { METHODS } from "@/lib/constants";
import { GOOGLE } from "@/lib/urls";
import { NearbyPlaces, RankPreference } from "@/types/google";

import {
  EXCLUDED_NON_FOOD_TYPES,
  FOOD_AND_DRINK_TYPES,
} from "../features/menu/constants";

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
  "iconMaskBaseUri",
  "primaryType",
  "primaryTypeDisplayName",
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
    return places.filter(
      (place) => !!place.currentOpeningHours?.openNow && !!place.primaryType,
    );
  } catch (error) {
    console.error("[API]: Error fetching nearby places", error);
    throw error;
  }
};

// https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#example_autocomplete_requests
type AutocompleteSuggestion = {
  placePrediction?: {
    place: `places/${string}`;
    placeId: string;
    text: {
      text: string;
      matches: {
        endOffset: number;
        startOffset: number;
      }[];
    };
    structuredFormat?: {
      mainText: {
        text: string;
        matches: { endOffset: number; startOffset: number }[];
      };
      secondaryText: { text: string };
    };
  };
};

type AutocompleteResponse = {
  suggestions: AutocompleteSuggestion[];
};

export type AutocompleteResult = {
  placeId: string;
  text: string;
  place: `places/${string}`;
};

/** Fetches autocomplete suggestions from the Google Places API. */
export const fetchAddressSuggestions = async (
  input: string,
): Promise<AutocompleteResult[]> => {
  try {
    const response = await fetch(GOOGLE.POST.autocomplete, {
      method: METHODS.POST,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
      body: JSON.stringify({
        input,
        // TODO: Add intelligent region detection (au, us, etc.) - AU only (for now!)
        includedRegionCodes: ["au"],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch autocomplete suggestions: ${response.statusText}`,
      );
    }

    const { suggestions = [] }: AutocompleteResponse = await response.json();

    const transformedSuggestions = suggestions
      .filter((suggestion) => suggestion.placePrediction)
      .map((suggestion) => ({
        placeId: suggestion.placePrediction!.placeId,
        text: suggestion.placePrediction!.text.text,
        place: suggestion.placePrediction!.place,
      }));

    return transformedSuggestions;
  } catch (error) {
    console.error("[API]: Error fetching autocomplete suggestions", error);
    throw error;
  }
};

type PlaceDetailsResponse = {
  id: string;
  location: { latitude: number; longitude: number };
  displayName: { text: string; languageCode: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
};

/** Fetches place details by place ID to get coordinates. */
export const fetchAddressDetails = async (
  placeId: string,
): Promise<{ lat: number; lng: number; address: string; name: string }> => {
  try {
    const response = await fetch(`${GOOGLE.GET.placeDetails}/${placeId}`, {
      method: METHODS.GET,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask":
          "id,location,displayName,formattedAddress,shortFormattedAddress",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch place details: ${response.statusText} - ${errorText}`,
      );
    }

    const place: PlaceDetailsResponse = await response.json();

    return {
      lat: place.location.latitude,
      lng: place.location.longitude,
      address:
        place.formattedAddress ||
        place.shortFormattedAddress ||
        place.displayName.text,
      name: place.displayName.text,
    };
  } catch (error) {
    console.error("[API]: Error fetching place details", error);
    throw error;
  }
};
