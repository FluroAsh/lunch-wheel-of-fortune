import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { AutocompleteResult, fetchAddressSuggestions } from "@/lib/api";
import { useMapStore } from "@/store";

const MIN_INPUT_LENGTH = 3;

/**
 * Hook for autocomplete search functionality.
 * Uses React Query for server state management.
 * Updates Zustand UI state based on query results.
 */
export const useAutocompleteSearch = (input: string) => {
  const { setShouldShowSuggestions } = useMapStore();

  const query = useQuery<AutocompleteResult[]>({
    queryKey: ["autocomplete", input],
    queryFn: () => fetchAddressSuggestions(input),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!input && input.trim().length >= MIN_INPUT_LENGTH,
  });

  // Update UI state based on query results
  useEffect(() => {
    console.log("query.data", query.data);
    if (query.data !== undefined) {
      // Hide suggestions if no results and input is empty
      if (query.data.length === 0 && input.trim().length === 0) {
        setShouldShowSuggestions(false);
      }
    }
  }, [query.data, input]);

  return query;
};
