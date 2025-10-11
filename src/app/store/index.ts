import { create } from "zustand";

import { clearAllCache, clearExpiredCache } from "@/lib/cache";
import { NearbyPlaces } from "@/types/google";

type PlacesState = {
  places: NearbyPlaces;
  radius: number;
  setPlaces: (places: NearbyPlaces) => void;
  setRadius: (radius: number) => void;
  clearCache: () => void;
  clearExpiredCache: () => void;
};

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  radius: 1000,
  setPlaces: (places: NearbyPlaces | undefined) => set({ places }),
  setRadius: (radius: number) => set({ radius }),
  clearCache: clearAllCache,
  clearExpiredCache: clearExpiredCache,
}));
