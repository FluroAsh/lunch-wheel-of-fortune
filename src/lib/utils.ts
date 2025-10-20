import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateText = (length = 10, text: string) =>
  text.length > length ? text.slice(0, length) + "..." : text;

export const filterLatLng = (place: google.maps.places.PlaceResult) => {
  const lat =
    typeof place.geometry?.location?.lat === "function"
      ? place.geometry?.location?.lat()
      : place.geometry?.location?.lat;

  const lng =
    typeof place.geometry?.location?.lng === "function"
      ? place.geometry?.location?.lng()
      : place.geometry?.location?.lng;

  return typeof lat === "number" && typeof lng === "number";
};

export const getLatLng = (place: google.maps.places.PlaceResult) => {
  const lat =
    typeof place.geometry?.location?.lat === "function"
      ? place.geometry?.location?.lat()
      : ((place.geometry?.location?.lat ?? 0) as number);

  const lng =
    typeof place.geometry?.location?.lng === "function"
      ? place.geometry?.location?.lng()
      : ((place.geometry?.location?.lng ?? 0) as number);

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
