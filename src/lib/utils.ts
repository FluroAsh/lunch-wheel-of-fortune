import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateText = (length = 10, text: string) =>
  text.length > length ? text.slice(0, length) + "..." : text;
