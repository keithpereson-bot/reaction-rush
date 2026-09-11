"use client";

import { useEffect, useState } from "react";

const COLORS = ["#a3ff12", "#3b82f6", "#e11d48", "#eab308", "#a855f7", "#22c55e"];

interface Particle {
  id: number;
  left: number; // percent
  delayMs: number;
  color: string;
  size: number;
  rotation: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Renders briefly whenever `trigger` changes to a truthy, new value.
// Usage: <Confetti trigger={isNewBest} />
export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!trigger || reducedMotion) return;
    const next: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delayMs: Math.random() * 200,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setParticles(next);
    const timeout = setTimeout(() => setParticles([]), 1400);
    return () => clearTimeout(timeout);
  }, [trigger, reducedMotion]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-confetti-fall rounded-sm"
          style={{
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delayMs}ms`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
