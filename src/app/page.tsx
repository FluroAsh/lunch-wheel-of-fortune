import Link from "next/link";

import "@/css/map.css";
import GoogleMap from "@/features/menu/components/map";
import { MapList } from "@/features/menu/components/map-list";

export default function Home() {
  return (
    <div>
      <div>
        <h1>Lunch Wheel of Fortune</h1>
        <p>Spin the wheel, and let the wheel decide what&apos;s on the menu!</p>
      </div>

      <GoogleMap />
      <MapList />

      <div className="flex justify-center">
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
