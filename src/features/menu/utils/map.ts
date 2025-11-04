import { PRICE_LEVELS } from "@/lib/constants";
import { GooglePlace, PriceLevel } from "@/types/google";

export const getPriceLevel = (price_level: PriceLevel | undefined) => {
  if (!price_level) {
    return undefined;
  }

  let priceLevel = "";

  switch (PRICE_LEVELS[price_level]) {
    case 1:
      priceLevel = "Free!";
      break;
    case 2:
      priceLevel = "$";
      break;
    case 3:
      priceLevel = "$$";
      break;
    case 4:
      priceLevel = "$$$";
      break;
    case 5:
      priceLevel = "$$$$";
      break;
  }

  return priceLevel;
};

export const getPriceRange = (
  price_range: GooglePlace["priceRange"] | undefined,
) => {
  if (!price_range) {
    return {};
  }

  const readablePriceRange = `$${price_range.startPrice.units} - $${price_range.endPrice.units}`;

  return {
    readablePriceRange,
    startPrice: price_range.startPrice,
    endPrice: price_range.endPrice,
  };
};
