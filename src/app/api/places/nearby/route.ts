import { NextResponse } from "next/server";

import {
  EXCLUDED_NON_FOOD_TYPES,
  FOOD_AND_DRINK_TYPES,
} from "@/features/menu/constants";
import { METHODS } from "@/lib/constants";
import { GOOGLE } from "@/lib/urls";
import type { NearbyPlaces, RankPreference } from "@/types/google";

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

export async function POST(request: Request) {
  // TODO: Add rate limiting for fetch requests...
  const { lat, lng, radius } = await request.json();

  try {
    const res = await fetch(GOOGLE.POST.searchNearby, {
      method: METHODS.POST,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.SERVER_GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask": fieldMask, // https://developers.google.com/maps/documentation/places/web-service/nearby-search#fieldmask
      },
      body: JSON.stringify({
        includedTypes: FOOD_AND_DRINK_TYPES,
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

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const { places = [] }: { places: NearbyPlaces } = data;

    // No intention to currently return places that are not open
    // But might add some better UI/UX for this in the future.
    const filteredPlaces = places.filter(
      (place) => !!place.currentOpeningHours?.openNow && !!place.primaryType,
    );

    return NextResponse.json(filteredPlaces);
  } catch (error) {
    return NextResponse.json(
      { errorMessage: (error as Error).message },
      { status: 500 },
    );
  }
}
