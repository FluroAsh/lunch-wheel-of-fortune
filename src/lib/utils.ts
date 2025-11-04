import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { GooglePlace } from "@/types/google";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateText = (length = 10, text: string) =>
  text.length > length ? text.slice(0, length) + "..." : text;

export const filterLatLng = (place: GooglePlace) => {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  return typeof lat === "number" && typeof lng === "number";
};

export const getLatLng = (place: GooglePlace) => {
  const lat = place.location.latitude;
  const lng = place.location.longitude;
  return { lat, lng };
};

export const getAspectRatio = (width: number, height: number) => {
  switch (true) {
    case width < height:
      return "aspect-[9/16]";
    case width > height:
      return "aspect-[16/9]";
    default:
      return "aspect-square";
  }
};
