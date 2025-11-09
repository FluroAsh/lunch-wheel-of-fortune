import Link from "next/link";

import "@/css/map.css";
import GoogleMap from "@/features/menu/components/map";
import { MapList } from "@/features/menu/components/map-list";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full bg-neutral-600">
        <div className="mx-auto max-w-5xl px-4 py-2">
          <h1 className="text-2xl font-bold">Lunch Wheel of Fortune</h1>
          <p>
            Spin the wheel, and let the wheel decide what&apos;s on the menu!
          </p>
        </div>
      </div>

      <div className="mx-auto grid size-full max-w-7xl grid-cols-1 grid-rows-[1.5fr_1fr] gap-4 px-4 py-4 lg:grid-cols-[1fr_minmax(600px,auto)] lg:grid-rows-1">
        <GoogleMap />
        <MapList />
      </div>

      <div className="sticky bottom-0 mt-auto flex justify-center bg-neutral-600 px-4 py-2">
        <Link
          href="/spin"
          className="rounded-md bg-blue-500 px-4 py-2 text-blue-100 transition-colors duration-200 hover:bg-blue-600"
        >
          Spin the wheel
        </Link>
      </div>
    </div>
  );
}
