import { useEffect, useState } from "react";

/** Thin progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
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
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full origin-left bg-primary/70"
        style={{ transform: `scaleX(${p})`, transition: "transform 120ms linear" }}
      />
    </div>
  );
}
