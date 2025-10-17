import { create } from "zustand";

import { clearAllCache, clearExpiredCache } from "@/lib/cache";
import { MAP } from "@/lib/constants";
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
  radius: MAP.defaultRadius,
  setPlaces: (places: NearbyPlaces | undefined) => set({ places }),
  setRadius: (radius: number) => set({ radius }),
  clearCache: clearAllCache,
  clearExpiredCache: clearExpiredCache,
}));
