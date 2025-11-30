import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const AutocompleteAddressInput = ({
  isLoading,
}: {
  isLoading: boolean;
}) => {
  return (
    <div className="absolute top-0 right-0 left-0 z-10 w-fit max-w-full p-2 lg:p-4">
      <div id="address-input-wrapper" className="relative">
        <SearchIcon className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 stroke-neutral-400 text-neutral-100" />
        <input
          id="search-address-input"
          className={cn(
            "w-[150px] max-w-full rounded-md bg-neutral-900 p-1.5 pl-8.5 text-neutral-100 opacity-80 backdrop-blur-lg",
            "truncate transition-[opacity,width]",
            "focus:w-[220px] focus:opacity-100 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          )}
          type="text"
          placeholder="Search by address..."
          disabled={isLoading}
        />

        {/* Suggestion List (when input is focused & suggestions are available) */}
        {/* Positioned absolutely relative to the input wrapper */}
        {/* <SuggestionList /> */}
      </div>
    </div>
  );
};
