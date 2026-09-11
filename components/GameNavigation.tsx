import Link from "next/link";
import { SITE } from "@/config/game";
import { SoundToggle } from "./SoundToggle";

export function GameNavigation() {
  return (
    <header className="border-b border-white/5">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
          {SITE.name}
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-white/70">
          <Link href="/" className="transition-colors hover:text-white">
            Games
          </Link>
          <Link href="/daily" className="transition-colors hover:text-white">
            Daily Challenge
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-white">
            Leaderboard
          </Link>
          <SoundToggle />
        </div>
      </nav>
    </header>
  );
}
