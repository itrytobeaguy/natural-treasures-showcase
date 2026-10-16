import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const themes = ["evergreen", "ocean", "mountain"] as const;
type NatureTheme = (typeof themes)[number];

export function NatureThemes() {
  const [theme, setTheme] = useState<NatureTheme>("evergreen");
  const [interactive, setInteractive] = useState(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("natural-treasures-theme");
      const enabled = localStorage.getItem("natural-treasures-mouse") !== "off";
      setInteractive(enabled);
      document.documentElement.dataset.mouseInteraction = enabled ? "on" : "off";
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
    <Popover>
      <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label="Appearance" title="Appearance" className="rounded-none"><Palette /></Button></PopoverTrigger>
      <PopoverContent align="end" className="appearance-panel w-80 max-w-[calc(100vw-2rem)] rounded-none p-6">
        <h2 className="text-xl">Nature, in color</h2>
        <div className="my-6 space-y-3" role="group" aria-label="Nature theme">
          {themes.map((item) => (
            <Button key={item} variant="ghost" onClick={() => select(item)} aria-label={`${item[0].toUpperCase()}${item.slice(1)} theme`} aria-pressed={theme === item} className="h-auto w-full justify-between rounded-none p-0 hover:bg-transparent">
              <span className="flex items-center gap-3"><span className={`palette-strip palette-${item}`} aria-hidden="true"><i /><i /><i /></span><span className="text-sm capitalize">{item}</span></span>
              {theme === item && <Check aria-hidden="true" />}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
          <label htmlFor="mouse-interaction" className="text-sm">Mouse interaction</label>
          <Switch id="mouse-interaction" checked={interactive} onCheckedChange={(enabled) => {
            setInteractive(enabled);
            document.documentElement.dataset.mouseInteraction = enabled ? "on" : "off";
            try { localStorage.setItem("natural-treasures-mouse", enabled ? "on" : "off"); } catch { /* Optional persistence. */ }
          }} />
        </div>
      </PopoverContent>
    </Popover>
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