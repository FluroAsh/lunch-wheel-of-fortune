import { NearbyPlaces } from "@/types/google";
import { create } from "zustand";

type PlacesState = {
  places: NearbyPlaces;
  radius: number;
  setPlaces: (places: NearbyPlaces) => void;
  setRadius: (radius: number) => void;
};

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  radius: 1000,
  setPlaces: (places: NearbyPlaces | undefined) => set({ places }),
  setRadius: (radius: number) => set({ radius }),
}));
