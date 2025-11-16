import { LucideCheck } from "lucide-react";

import { Checkbox, Label } from "@/components/checkbox";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { getPriceLevel, getPriceRange } from "../../utils/map";
import { StarRating } from "../star-rating";

export const ListRow = ({ place }: { place: GooglePlace }) => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();

  const { displayName, rating } = place;

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
        htmlFor={`place-checkbox-${place.id}`}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-md border border-neutral-700 px-3 py-2 opacity-100 transition-[colors_opacity]",
          "bg-neutral-700/40 has-checked:border-emerald-500 has-checked:bg-emerald-950/40",
          "text-neutral-400 has-checked:text-emerald-400",
          "has-disabled:cursor-not-allowed has-disabled:opacity-60",
        )}
      >
        <Checkbox
          id={`place-checkbox-${place.id}`}
          className="hidden"
          checked={isSelected || hasForcedSelection}
          onChange={handleCheckboxChange}
          disabled={hasForcedSelection}
        />

        <div className="flex-0.5 flex min-w-[100px] items-center gap-2">
          <StarRating rating={rating ?? 0} isMobile />
          <span className="flex items-center pl-0.5 text-sm">
            {displayPrice}
          </span>
        </div>

        <span className="flex-2 truncate">{displayName.text}</span>

        <LucideCheck
          className={cn(
            "ml-auto size-4 opacity-0 transition-opacity duration-200",
            (isSelected || hasForcedSelection) && "opacity-100",
          )}
        />
      </Label>
    </li>
  );
};
