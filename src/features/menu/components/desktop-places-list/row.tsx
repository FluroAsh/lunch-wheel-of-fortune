import Link from "next/link";

import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { getPriceLevel, getPriceRange } from "../../utils/map";
import { StarRating } from "../star-rating";

const PlaceNameLink = ({
  placeId,
  placeName,
  href,
}: {
  placeId: string;
  placeName: string;
  href: string;
}) => {
  const { setActiveMarker } = useMapStore();

  return (
    <Link
      className="max-w-full truncate px-2 hover:text-blue-500 hover:underline"
      href={href}
      target="_blank"
      onMouseEnter={() => setActiveMarker(placeId)}
      onMouseLeave={() => setActiveMarker(undefined)}
    >
      {placeName}
    </Link>
  );
};

type ListRowProps = {
  place: GooglePlace;
  isEven: boolean;
};

// Each row is a checkbox that can selected, or de-selected
export const ListRow = ({ place, isEven }: ListRowProps) => {
  const { displayName, id, rating } = place;

  const priceLevel = getPriceLevel(place.priceLevel);
  const { startPrice } = getPriceRange(place.priceRange);

  const displayPrice = priceLevel
    ? priceLevel
    : startPrice
      ? `$${Number(startPrice.units).toFixed(2)}`
      : "—";

  return (
    <li
      key={id}
      className={cn(
        "flex w-full gap-4 bg-neutral-700/50 px-2 py-1.5",
        isEven ? "bg-neutral-700/50" : "bg-neutral-700/25",
      )}
    >
      <div className="flex w-[150px] shrink-0 items-center gap-2">
        <StarRating rating={rating ?? 0} />
        <span className="flex items-center pl-0.5 text-sm">{displayPrice}</span>
      </div>

      <PlaceNameLink
        placeId={id}
        placeName={displayName.text}
        href={getPlacesSearchUrl({
          placeName: displayName.text,
          placeId: id,
        })}
      />
    </li>
  );
};
