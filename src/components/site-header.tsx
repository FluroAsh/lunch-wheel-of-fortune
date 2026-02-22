import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full shrink-0 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/">
          <Image
            src="/favicon.ico"
            alt="Wheel of Flavours"
            width={32}
            height={32}
            className="size-7 lg:size-8"
          />
        </Link>

        <div>
          <h1 className="text-base leading-tight font-semibold text-neutral-100 lg:text-lg">
            Wheel of Flavours
          </h1>
          <p className="text-xs text-neutral-400">
            Spin the wheel. Let fate decide lunch.
          </p>
        </div>
      </div>
    </header>
  );
}
