import { useRef, useState } from "react";

import { LucideXCircle, SearchIcon } from "lucide-react";
import { debounce } from "radash";

import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useAutocompleteSearch } from "../../hooks/use-autocomplete-search";
import { SuggestionList } from "./suggestion-list";

export const AutocompleteAddressInput = ({
  isLoading,
}: {
  isLoading: boolean;
}) => {
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const {
    autocompleteInput,
    setAutocompleteInput,
    shouldShowSuggestions,
    setShouldShowSuggestions,
    isFetchingDetails,
    resetAutocomplete,
  } = useMapStore();

  // Use debounced query for API calls
  const { data: suggestions = [], isLoading: isLoadingSuggestions } =
    useAutocompleteSearch(debouncedSearchQuery);

  // Debounce function ref to persist across renders
  const debouncedSetQuery = useRef<ReturnType<typeof debounce>>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAutocompleteInput(value); // Optimistically update input

    debouncedSetQuery.current?.cancel();

    debouncedSetQuery.current = debounce({ delay: 500 }, (query: string) =>
      setDebouncedSearchQuery(query),
    );
    debouncedSetQuery.current(value);
  };

  const showSuggestions =
    shouldShowSuggestions &&
    (suggestions.length > 0 ||
      !isLoadingSuggestions ||
      autocompleteInput.trim().length > 0);

  const showClearButton = autocompleteInput.length > 0;

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
            "focus:w-[220px] focus:opacity-100 focus:ring-2 focus:ring-sky-500 focus:outline-none",
            "data-[active=true]:w-[220px] data-[active=true]:opacity-100 data-[active=true]:ring-2 data-[active=true]:ring-sky-500 data-[active=true]:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          data-active={isInputActive || showSuggestions}
          value={autocompleteInput}
          onChange={handleInputChange}
          onFocus={() => {
            setIsInputActive(true);
            setShouldShowSuggestions(true);
          }}
          onBlur={
            () =>
              setTimeout(() => {
                setIsInputActive(false);
                setShouldShowSuggestions(false);
              }, 200) // Delay to allow click events on suggestions
          }
          type="text"
          placeholder="Search address..."
          disabled={isLoading || isFetchingDetails}
        />

        {showClearButton && (
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => resetAutocomplete()}
          >
            <LucideXCircle className="size-4 text-neutral-400" />
          </button>
        )}

        {showSuggestions && <SuggestionList suggestions={suggestions} />}
      </div>
    </div>
  );
};
