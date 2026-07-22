import { useEffect, useRef } from "react";

/**
 * Full-page dot grid overlay. Dots are anchored to the document (they scroll
 * with the page). Dots near the cursor grow larger and shift toward green.
 * Rendered as a fixed canvas at z-index 0 so any card/section with a solid
 * background naturally hides the dots behind it.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const scrollRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 28;
    const BASE_RADIUS = 1.2;
    const MAX_RADIUS = 4.5;
    const INFLUENCE = 130; // px

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      rafRef.current = null;
      ctx.clearRect(0, 0, width, height);

      // Cursor position in document coords
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;

      const sx = scrollRef.current.x;
      const sy = scrollRef.current.y;

      // Doc coord range currently visible
      const startDocX = Math.floor(sx / SPACING) * SPACING;
      const startDocY = Math.floor(sy / SPACING) * SPACING;
      const endDocX = sx + width + SPACING;
      const endDocY = sy + height + SPACING;

      const inf2 = INFLUENCE * INFLUENCE;

      for (let dy = startDocY; dy < endDocY; dy += SPACING) {
        for (let dx = startDocX; dx < endDocX; dx += SPACING) {
          const screenX = dx - sx;
          const screenY = dy - sy;

          let radius = BASE_RADIUS;
          // base muted color
          let r = 180;
          let g = 180;
          let b = 170;
          let a = 0.35;

          if (active) {
            const ddx = dx - mx;
            const ddy = dy - my;
            const dist2 = ddx * ddx + ddy * ddy;
            if (dist2 < inf2) {
              const t = 1 - Math.sqrt(dist2) / INFLUENCE; // 0..1
              const ease = t * t;
              radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * ease;
              // toward forest green oklch(0.42 0.055 145) ~ #4a6b4a
              r = Math.round(180 + (74 - 180) * ease);
              g = Math.round(180 + (107 - 180) * ease);
              b = Math.round(170 + (74 - 170) * ease);
              a = 0.35 + 0.55 * ease;
            }
          }

          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          ctx.fill();
        }
      }
    };

    const schedule = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX + window.scrollX;
      mouseRef.current.y = e.clientY + window.scrollY;
      mouseRef.current.active = true;
      schedule();
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      schedule();
    };
    const onScroll = () => {
      scrollRef.current.x = window.scrollX;
      scrollRef.current.y = window.scrollY;
      // keep cursor doc-coord aligned as page scrolls under it
      // (clientX/Y didn't change, but scroll did)
      schedule();
    };
    const onResize = () => {
      resize();
      schedule();
    };

    resize();
    scrollRef.current.x = window.scrollX;
    scrollRef.current.y = window.scrollY;
    schedule();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}