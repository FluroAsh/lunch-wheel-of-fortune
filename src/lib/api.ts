import { METHODS } from "@/lib/constants";
import { GOOGLE } from "@/lib/urls";

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
