import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref plus an offset in px that moves as the element travels
 * through the viewport. Positive strength = slower-than-scroll drift.
 */
export function useParallax<T extends HTMLElement>(strength = 60) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // ~ -1..1
      setOffset(Math.max(-1, Math.min(1, progress)) * strength);
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return { ref, offset };
}
