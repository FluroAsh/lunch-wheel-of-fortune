import Link from "next/link";

import { GENERIC_PLACE_ICON } from "@/lib/constants";
import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { GooglePlace } from "@/types/google";

export const PreviewItem = ({ place }: { place: GooglePlace }) => {
  return (
    <Link
      key={place.id}
      href={getPlacesSearchUrl({
        placeName: place.displayName.text,
        placeId: place.id,
      })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${place.displayName.text} in Google Maps`}
      className={cn(
        "group relative flex min-h-[36px] w-full rounded-full border px-4 py-1.5",
        "border-neutral-600/60 bg-gradient-to-br from-neutral-700/60 to-neutral-800/50 shadow-sm",
        "transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-br hover:from-emerald-950/40 hover:to-emerald-900/30 hover:shadow-md",
        "focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:outline-none active:scale-95",
      )}
    >
      <div className="mt-0.5 mr-2 flex items-center">
        <img
          src={`${place.iconMaskBaseUri ?? GENERIC_PLACE_ICON}.svg`}
          alt={place.primaryTypeDisplayName.text}
          className="size-3 min-w-3 invert"
        />
      </div>

      <div className="overflow-hidden">
        <p className="truncate text-xs text-neutral-100">
          {place.displayName.text}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {place.primaryTypeDisplayName.text}
        </p>
      </div>
    </Link>
  );
};
