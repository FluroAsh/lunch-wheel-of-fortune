import { useQuery } from "@tanstack/react-query";

import { AutocompleteResult, fetchAddressSuggestions } from "@/lib/api";
import { useMapStore } from "@/store";

import { useGeolocation } from "./use-geolocation";

const MIN_INPUT_LENGTH = 2;

export const useAutocompleteSearch = (input: string) => {
  const { radius } = useMapStore();
  const {
    coords: { lat, lng },
  } = useGeolocation();

  return useQuery<AutocompleteResult[]>({
    queryKey: ["autocomplete", input],
    queryFn: async () => fetchAddressSuggestions(input, { lat, lng, radius }),
    enabled:
      !!input && input.length >= MIN_INPUT_LENGTH && !!lat && !!lng && !!radius,
  });
};
