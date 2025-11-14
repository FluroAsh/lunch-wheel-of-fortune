import Link from "next/link";

import { Checkbox, Label } from "@/components/checkbox";
import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { getPriceLevel, getPriceRange } from "../../utils/map";
import { StarRating } from "../star-rating";

const PlaceNameLink = ({
  placeName,
  href,
  isSelected,
}: {
  placeName: string;
  href: string;
  isSelected: boolean;
}) => (
  <Link
    className={cn(
      "max-w-full truncate transition-colors hover:text-emerald-400 hover:underline",
      isSelected ? "text-emerald-400" : "text-neutral-400",
    )}
    href={href}
    target="_blank"
  >
    {placeName}
  </Link>
);

type ListRowProps = {
  place: GooglePlace;
  isEven: boolean;
};

// Each row is a checkbox that can selected, or de-selected
export const ListRow = ({ place, isEven }: ListRowProps) => {
  const {
    setSelectedPlaceIds: setSelectedPlaceIds,
    selectedPlaceIds,
    setActiveMarker,
  } = useMapStore();

  const { displayName, id, rating } = place;

  const priceLevel = getPriceLevel(place.priceLevel);
  const { startPrice } = getPriceRange(place.priceRange);

  const displayPrice = priceLevel
    ? priceLevel
    : startPrice
      ? `$${Number(startPrice.units).toFixed(2)}`
      : "—";

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Must have at-least, one selected place.
    if (selectedPlaceIds.length === 1 && !e.target.checked) {
      return;
    }

    setSelectedPlaceIds(
      e.target.checked
        ? [...selectedPlaceIds, place.id]
        : selectedPlaceIds.filter((id) => id !== place.id),
    );
  };

  const isSelected = selectedPlaceIds.includes(place.id);
  const hasForcedSelection =
    selectedPlaceIds.length === 1 && place.id === selectedPlaceIds[0];

  return (
    <li>
      <Label
        htmlFor={`place-checkbox-${id}`}
        className={cn(
          "relative flex w-full items-center gap-3 px-3 py-2 transition-all duration-200",
          "border-l-2 hover:cursor-pointer hover:brightness-125",
          "border-transparent has-checked:border-emerald-500 has-checked:bg-emerald-950/30",
          "has-disabled:cursor-not-allowed has-disabled:opacity-60",
          isEven
            ? "bg-neutral-700/40 has-checked:bg-emerald-950/40"
            : "bg-neutral-800/30 has-checked:bg-emerald-950/25",
        )}
        onMouseEnter={() => setActiveMarker(id)}
        onMouseLeave={() => setActiveMarker(undefined)}
      >
        <Checkbox
          id={`place-checkbox-${id}`}
          className="hidden"
          onChange={handleCheckboxChange}
          checked={isSelected || hasForcedSelection}
          disabled={hasForcedSelection}
        />

        <div className="flex w-[150px] shrink-0 items-center gap-2">
          <StarRating rating={rating ?? 0} />
          <span className="flex items-center pl-0.5 text-sm">
            {displayPrice}
          </span>
        </div>

        <PlaceNameLink
          placeName={displayName.text}
          isSelected={isSelected}
          href={getPlacesSearchUrl({
            placeName: displayName.text,
            placeId: id,
          })}
        />
      </Label>
    </li>
  );
};
