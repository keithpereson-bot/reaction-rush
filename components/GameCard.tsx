import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
}

export function GameCard({ title, description, href, comingSoon }: GameCardProps) {
  const content = (
    <div
      className={`h-full rounded-2xl border border-white/5 p-6 transition-colors ${
        comingSoon ? "bg-base-800/50" : "bg-base-800 hover:bg-base-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        {comingSoon && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
            Coming soon
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-white/60">{description}</p>
    </div>
  );

  if (comingSoon || !href) {
    return <div aria-disabled="true">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
