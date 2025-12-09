import { useMap } from "@vis.gl/react-google-maps";

import { type AutocompleteResult, fetchAddressDetails } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

const SuggestionItem = ({
  placeId,
  text,
  className,
}: {
  placeId: string;
  text: string;
  className?: string;
}) => {
  const map = useMap();
  const { setSearchLocation, setIsFetchingDetails, resetAutocomplete } =
    useMapStore();

  const handleSuggestionClick = async (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>,
  ) => {
    e.preventDefault(); // Prevent input blur
    const target = e.currentTarget;

    setIsFetchingDetails(true);

    try {
      const { lat, lng } = await fetchAddressDetails(placeId);
      map!.panTo({ lat, lng });
      setSearchLocation({ lat, lng });
      resetAutocomplete();
    } catch (error) {
      console.error("Failed to fetch place details:", error);
    } finally {
      setIsFetchingDetails(false);
      target.blur();
    }
  };

  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (e.key === "Enter") {
      handleSuggestionClick(e);
    }
  };

  return (
    <button
      key={placeId}
      type="button"
      className={cn(
        "w-full overflow-hidden bg-neutral-900 px-3 py-2 text-left text-sm text-neutral-100 transition-colors hover:bg-neutral-800",
        "focus:ring-offset focus:ring-2 focus:ring-sky-500 focus:ring-offset-sky-500 focus:outline-none",
        className,
      )}
      onMouseDown={handleSuggestionClick}
      onKeyDown={handleSuggestionKeyDown}
    >
      {text}
    </button>
  );
};

export const SuggestionList = ({
  suggestions,
}: {
  suggestions: AutocompleteResult[];
}) => {
  const { setShouldShowSuggestions } = useMapStore();

  return (
    <div
      id="suggestion-list-wrapper"
      className="absolute top-full right-0 left-0 z-20 mt-2 w-full shadow-lg"
      onFocus={() => setShouldShowSuggestions(true)}
      // onBlur={() => setShouldShowSuggestions(false)}
    >
      {suggestions.map((suggestion, idx) => (
        <SuggestionItem
          key={suggestion.placeId}
          placeId={suggestion.placeId}
          text={suggestion.text}
          className={cn(
            idx === 0 ? "rounded-t-md" : "",
            idx === suggestions.length - 1 ? "rounded-b-md" : "",
          )}
        />
      ))}
    </div>
  );
};
