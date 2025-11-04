// Broad food/drink types that cover most establishments
// Using parent types instead of specific subtypes to stay under Google's 50 limit (both included and excluded types)
export const FOOD_AND_DRINK_TYPES = [
  "restaurant", // Covers common restaurant subtypes
  "cafe",
  "bar",
  "bakery",
  "meal_delivery",
  "meal_takeaway",
  "fast_food_restaurant",
  "ice_cream_shop",
  "coffee_shop",
  "dessert_shop",
  "candy_store",
  "deli",
  "sandwich_shop",
  "food_court",
  "pub",
] as const;

// Common non-food/drink categories to exclude
// This helps filter out places that might have food but aren't primarily food establishments
export const EXCLUDED_NON_FOOD_TYPES = [
  "gas_station",
  "convenience_store",
  "grocery_store",
  "supermarket",
  "pharmacy",
  "lodging",
  "hotel",
  "motel",
  "hospital",
  "school",
  "university",
  "gym",
  "park",
  "tourist_attraction",
  "museum",
  "shopping_mall",
  "store",
  "department_store",
  "clothing_store",
  "electronics_store",
  "book_store",
  "library",
  "post_office",
  "bank",
  "atm",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "parking",
  "real_estate_agency",
  "lawyer",
  "accounting",
  "insurance_agency",
  "moving_company",
  "storage",
  "funeral_home",
  "cemetery",
  "church",
  "synagogue",
  "mosque",
  "hindu_temple",
] as const;

const GOOGLE_TYPE_LIMIT = 50;

if (
  FOOD_AND_DRINK_TYPES.length > GOOGLE_TYPE_LIMIT ||
  EXCLUDED_NON_FOOD_TYPES.length > GOOGLE_TYPE_LIMIT
) {
  throw new Error(
    "FOOD_AND_DRINK_TYPES or EXCLUDED_NON_FOOD_TYPES must be less than 50",
  );
}
