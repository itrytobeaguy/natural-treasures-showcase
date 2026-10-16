import { displayText } from "@/lib/display-text";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CarouselImage = { id: string; image: string; title: string; collection: string | null };

export function ProductCarousel({ images }: { images: CarouselImage[] }) {
  const navigate = useNavigate();
  const [viewport, carousel] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!carousel) return;
    const update = () => { setSelected(carousel.selectedScrollSnap()); setRevealed(null); };
    carousel.on("select", update);
    return () => { carousel.off("select", update); };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || images.length < 2 || paused || hovered || revealed !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => carousel.scrollNext(), 5000);
    return () => window.clearInterval(timer);
  }, [carousel, images.length, paused, hovered, revealed]);

  if (!images.length) return null;
  return (
    <section aria-label="Featured product images" aria-roledescription="carousel" className="product-carousel relative border-b border-border" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
      <div ref={viewport} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {images.map((image, index) => (
            <div key={`${image.id}-${image.image}`} className="carousel-slide min-w-0 shrink-0 border-r border-border" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${images.length}`}>
              <Button variant="ghost" aria-label={revealed === index ? `Open ${displayText(image.title)}` : `Reveal ${displayText(image.title)}`} aria-expanded={revealed === index} className="carousel-image relative block h-full w-full rounded-none p-0 whitespace-normal" onClick={() => {
                if (revealed === index) navigate({ to: "/designs/$id", params: { id: image.id } });
                else setRevealed(index);
              }}>
                <img src={image.image} alt={displayText(image.title)} loading={index < 3 ? "eager" : "lazy"} className="h-full w-full object-contain" />
                {revealed === index && <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-card/95 p-5 text-left text-card-foreground">
                  <span className="min-w-0"><span className="product-title block text-lg">{displayText(image.title)}</span>{image.collection && <span className="mt-1 block text-xs text-muted-foreground">{displayText(image.collection)}</span>}</span>
                  <ArrowUpRight aria-hidden="true" className="shrink-0" />
                </span>}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-1 bg-card/95 p-1 text-card-foreground">
        <span className="px-2 text-xs tabular-nums" aria-live="polite">{String(selected + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
        <Button variant="ghost" size="icon" className="rounded-none" aria-label="Previous slide" title="Previous slide" onClick={() => carousel?.scrollPrev()}><ArrowLeft /></Button>
        <Button variant="ghost" size="icon" className="rounded-none" aria-label="Next slide" title="Next slide" onClick={() => carousel?.scrollNext()}><ArrowRight /></Button>
        <Button variant="ghost" size="icon" className="rounded-none" aria-label={paused ? "Play slideshow" : "Pause slideshow"} title={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button>
      </div>
    </section>
  );
}