import GoogleMap from "@/features/menu/components/map";

export default function Home() {
  return (
    <div>
      <div>
        <h1>Lunch Wheel of Fortune</h1>
        <p>Spin the wheel, and let the wheel decide what&apos;s on the menu!</p>
      </div>

      {/* Enabled when user location is available */}
      <GoogleMap />
    </div>
  );
}
