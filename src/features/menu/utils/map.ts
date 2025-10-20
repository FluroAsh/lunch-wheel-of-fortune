export const getPriceLevel = (price_level: number) => {
  switch (price_level) {
    case 1:
      return "$";
    case 2:
      return "$$";
    case 3:
      return "$$$";
    default:
      return "";
  }
};

export const getStarRating = (rating: number) => {
  // TODO: Handle partial stars
  switch (rating) {
    case 1: {
      return "☆";
    }
    case 2: {
      return "☆☆";
    }
    case 3: {
      return "☆☆☆";
    }
    case 4: {
      return "☆☆☆☆";
    }
    case 5: {
      return "☆☆☆☆☆";
    }
    default: {
      return "";
    }
  }
};
