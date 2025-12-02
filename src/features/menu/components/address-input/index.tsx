import { useRef, useState } from "react";

import { useMap } from "@vis.gl/react-google-maps";
import { SearchIcon } from "lucide-react";
import { debounce } from "radash";

import { fetchAddressDetails } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useAutocompleteSearch } from "../../hooks/use-autocomplete-search";

export const AutocompleteAddressInput = ({
  isLoading,
}: {
  isLoading: boolean;
}) => {
  const [input, setInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const map = useMap();
  const { data: suggestions, isLoading: isLoadingSuggestions } =
    useAutocompleteSearch(searchQuery);
  const { setSearchLocation } = useMapStore();

  const debouncedSearch = useRef<ReturnType<typeof debounce>>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    debouncedSearch.current?.cancel();

    if (value.trim().length === 0) {
      setSearchQuery("");
      return;
    }

    debouncedSearch.current = debounce({ delay: 300 }, (searchValue: string) =>
      setSearchQuery(searchValue),
    );
    debouncedSearch.current(value);
  };

  const handleSuggestionClick = async (placeId: string, text: string) => {
    setIsFetchingDetails(true);
    try {
      console.log("before", {
        placeId,
        text,
      });

      // get latest place details
      const details = await fetchAddressDetails(placeId);
      console.log("after", {
        placeId,
        text,
        details,
      });
      setSearchLocation({ lat: details.lat, lng: details.lng });
      map!.panTo({ lat: details.lat, lng: details.lng });
      setInput(text);
      setSearchQuery("");
      setIsFocused(false);
    } catch (error) {
      console.error("Failed to fetch place details:", error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const showSuggestions =
    isFocused &&
    searchQuery.length >= 2 &&
    (suggestions?.length ?? 0) > 0 &&
    !isFetchingDetails;

  console.log({ suggestions });

  return (
    <div className="absolute top-0 right-0 left-0 z-10 w-fit max-w-full p-2 lg:p-4">
      <div id="address-input-wrapper" className="relative">
        <SearchIcon className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 stroke-neutral-400 text-neutral-100" />
        <input
          name="street-address"
          autoComplete="off"
          className={cn(
            "w-[150px] max-w-full rounded-md bg-neutral-900 p-1.5 pl-8.5 text-neutral-100 opacity-80 backdrop-blur-lg",
            "truncate transition-[opacity,width]",
            "focus:w-[220px] focus:opacity-100 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          )}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click events on suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          type="text"
          placeholder="Search address..."
          disabled={isLoading || isFetchingDetails}
        />

        {showSuggestions && (
          <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-neutral-900 shadow-lg">
            {isLoadingSuggestions ? (
              <div className="p-2 text-sm text-neutral-400">Loading...</div>
            ) : (
              suggestions?.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-neutral-100 transition-colors hover:bg-neutral-800"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSuggestionClick(suggestion.placeId, suggestion.text);
                  }}
                >
                  {suggestion.text}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
