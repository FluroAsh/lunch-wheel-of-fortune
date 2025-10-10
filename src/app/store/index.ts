import { NearbyPlaces } from "@/types/google";
import { create } from "zustand";

type PlacesState = {
  places: NearbyPlaces;
  setPlaces: (places: NearbyPlaces) => void;
};

export const usePlaces = create<PlacesState>((set) => ({
  places: [],
  setPlaces: (places: NearbyPlaces) => set({ places }),
}));
