import "@/css/map.css";
import GoogleMap from "@/features/menu/components/map";
import { MapList } from "@/features/menu/components/map-list";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex max-h-dvh flex-1 flex-col">
      <div className="w-full border-b border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-2">
          <img
            src="/favicon.ico"
            alt="Flavour of the Week"
            className="size-6 lg:size-8"
          />
          <h1 className="text-lg font-bold lg:text-2xl">Flavour of the Week</h1>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto grid size-full max-w-7xl grid-cols-1 grid-rows-[minmax(50vh,350px)_1fr] gap-4 overflow-hidden px-4 py-4",
          "lg:grid-cols-[1fr_minmax(600px,auto)] lg:grid-rows-1",
        )}
      >
        <GoogleMap />
        <MapList />
      </div>
    </div>
  );
}
