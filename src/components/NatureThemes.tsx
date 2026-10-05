import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const themes = ["evergreen", "ocean", "mountain"] as const;
type NatureTheme = (typeof themes)[number];

export function NatureThemes() {
  const [theme, setTheme] = useState<NatureTheme>("evergreen");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("natural-treasures-theme");
      if (themes.some((item) => item === saved)) {
        const selected = saved as NatureTheme;
        setTheme(selected);
        document.documentElement.dataset.natureTheme = selected;
      }
    } catch { /* Theme selection still works without storage. */ }
  }, []);

  const select = (next: NatureTheme) => {
    setTheme(next);
    document.documentElement.dataset.natureTheme = next;
    try { localStorage.setItem("natural-treasures-theme", next); } catch { /* Optional persistence. */ }
  };

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Nature theme">
      {themes.map((item) => (
        <Button key={item} variant="ghost" size="icon" onClick={() => select(item)}
          aria-label={`${item[0].toUpperCase()}${item.slice(1)} theme`} aria-pressed={theme === item}
          title={`${item[0].toUpperCase()}${item.slice(1)}`} className={`theme-swatch theme-swatch-${item}`}>
          {theme === item && <Check aria-hidden="true" />}
        </Button>
      ))}
    </div>
  );
}

/** Scroll affects atmosphere, never the dot grid's geometry or cursor behavior. */
export function ScrollAtmosphere() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const progress = window.scrollY / Math.max(1, root.scrollHeight - window.innerHeight);
      const tide = reduced.matches ? 0 : (1 - Math.cos(progress * Math.PI * 4)) / 2;
      root.style.setProperty("--journey-tint", `${(tide * 35).toFixed(2)}%`);
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}