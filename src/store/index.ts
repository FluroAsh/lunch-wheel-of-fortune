import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { MAP } from "@/lib/constants";
import { Coords } from "@/types/google";

type MapState = {
  // -- Map State -- //
  radius: number;
  setRadius: (radius: number) => void;
  activeMarker: string | undefined;
  setActiveMarker: (id: string | undefined) => void;
  searchLocation: Coords | undefined;
  setSearchLocation: (location: Coords) => void;
  selectedPlaceIds: string[];
  setSelectedPlaceIds: (ids: string[]) => void;
  // -- Autocomplete UI State -- //
  autocompleteInput: string;
  setAutocompleteInput: (input: string) => void;
  /** Whether suggestions dropdown should be visible */
  shouldShowSuggestions: boolean;
  setShouldShowSuggestions: (shouldShow: boolean) => void;
  isFetchingDetails: boolean;
  setIsFetchingDetails: (isFetching: boolean) => void;
  /** Resets autocomplete state after selection */
  resetAutocomplete: () => void;
};

export const useMapStore = create<MapState>()(
  devtools((set) => ({
    // -- Map State -- //
    radius: MAP.defaultRadius,
    setRadius: (radius: number) => set({ radius }),
    activeMarker: undefined,
    setActiveMarker: (id: string | undefined) => set({ activeMarker: id }),
    searchLocation: undefined,
    setSearchLocation: (location: Coords) => set({ searchLocation: location }),
    selectedPlaceIds: [],
    setSelectedPlaceIds: (ids: string[]) => set({ selectedPlaceIds: ids }),
    // -- Autocomplete UI State -- //
    autocompleteInput: "",
    setAutocompleteInput: (input: string) =>
      set({ autocompleteInput: input, shouldShowSuggestions: true }),
    shouldShowSuggestions: false,
    setShouldShowSuggestions: (shouldShow: boolean) =>
      set({ shouldShowSuggestions: shouldShow }),
    isFetchingDetails: false,
    setIsFetchingDetails: (isFetching: boolean) =>
      set({ isFetchingDetails: isFetching }),
    resetAutocomplete: () =>
      set({
        autocompleteInput: "",
        shouldShowSuggestions: false,
        isFetchingDetails: false,
      }),
  })),
);
