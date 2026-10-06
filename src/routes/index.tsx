import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useHidePrices, HiddenPriceText } from "@/hooks/useHidePrices";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/useParallax";
import heroImage from "@/assets/hero-natural.jpg";
import cardFibers from "@/assets/card-fibers.jpg";
import cardBatches from "@/assets/card-batches.jpg";
import cardMadeToOrder from "@/assets/card-madetoorder.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Natural Treasures — Nature-inspired clothing" },
      { name: "description", content: "Quietly made clothing rooted in nature. Discover our current pieces." },
      { property: "og:title", content: "Natural Treasures" },
      { property: "og:description", content: "Quietly made clothing rooted in nature." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Home() {
  const hidePrices = useHidePrices();
  const hero = useParallax<HTMLDivElement>(70);
  const { data: designs } = useQuery({
    queryKey: ["featured-designs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("designs")
        .select("id, title, price, image_url, image_urls, category, in_stock")
        .eq("in_stock", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const featured = useMemo(() => {
    const withImages = (designs ?? []).filter(
      (d: any) => d.image_url || (d.image_urls && d.image_urls.length > 0),
    );
    const pool = withImages.length > 0 ? withImages : designs ?? [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [designs]);

  return (
    <div>
      <section className="pb-16">
        <div ref={hero.ref} className="nature-hero relative overflow-hidden">
          <img
            src={heroImage}
            alt="Model wearing the Yosemite National Park tee from Natural Treasures in a misty pine forest"
            width={1280}
            height={1600}
            style={{ transform: `translate3d(0, ${hero.offset}px, 0) scale(1.12)` }}
            className="absolute inset-0 h-full w-full object-cover object-[70%_center] will-change-transform"
          />
          <div className="hero-veil absolute inset-0" />
          <div className="relative mx-auto max-w-7xl grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 px-6 pt-8 sm:px-12 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 lg:pb-20 items-center">
            <div className="max-w-xl">
              <Reveal variant="blur" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
                <Leaf className="h-3.5 w-3.5" /> All Natural — grown slowly, worn gently
              </Reveal>
              <Reveal as="h1" delay={100} className="nature-headline font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.08] text-foreground">
                <span className="headline-line">Breathe Natural.</span>
                <br />
                <span className="headline-line"><em className="italic text-primary">Stay Comfortable.</em></span>
              </Reveal>
              <Reveal as="p" delay={220} className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-lg">
                It starts in a field, not a factory. Linen, cotton and hemp, cut by hand and finished in
                small batches — so what touches your skin still remembers where it came from. Soft on the
                first morning. Softer on the thousandth.
              </Reveal>
              <Reveal delay={340} className="mt-10 flex flex-wrap gap-4">
                <Button asChild className="h-12 rounded-full px-6 transition-transform hover:-translate-y-0.5"><Link to="/designs">
                  Explore the collection
                </Link></Button>
                <Button asChild variant="outline" className="h-12 rounded-full px-6 bg-background/60 backdrop-blur-sm"><Link to="/contact">
                  Tell us your story
                </Link></Button>
              </Reveal>
            </div>

            {featured.length > 0 && (
              <div className="featured-collage relative mx-auto">
                {featured.slice(0, 3).map((d: any, i: number) => {
                  const img = d.image_url ?? d.image_urls?.[0] ?? null;
                  return (
                    <div
                      key={d.id}
                      className="featured-frame"
                    >
                      <Reveal variant="scale" delay={i * 120} className="h-full w-full">
                        <Link
                          to="/designs/$id"
                          params={{ id: d.id }}
                          className="featured-link group relative block h-full w-full rounded-lg overflow-hidden border-[6px] border-card bg-card transition-all duration-500 hover:scale-[1.06] hover:-translate-y-2"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={d.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Leaf className="h-10 w-10 opacity-40" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 bg-gradient-to-t from-background/90 to-transparent">
                            <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                          </div>
                        </Link>
                      </Reveal>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 sm:px-12 pb-24">
        <div className="grid sm:grid-cols-3 gap-8">
          {([
            { t: "Natural fibers", d: "Linen, cotton, hemp — chosen for how they age.", img: cardFibers, alt: "Person wearing a natural linen tee in a field of tall grass" },
            { t: "Small batches", d: "Every piece is made in limited quantity, by hand.", img: cardBatches, alt: "Person wearing a sage cotton sweatshirt among misty pines" },
            { t: "Made to order", d: "Order what you love and we send it directly to you.", img: cardMadeToOrder, alt: "Two people wearing natural cotton tees walking a forest trail" },
          ]).map((f, i) => (
            <Reveal
              key={f.t}
              variant={i === 1 ? "up" : "blur"}
              delay={i * 150}
              once={false}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:bg-accent/40 hover:border-primary/40"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={f.img}
                  alt={f.alt}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="story-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-8">
                <div aria-hidden="true" className="story-rule mb-5 h-px w-12 bg-primary/50" />
                <h3 className="font-serif text-2xl">{f.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {(designs?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <Reveal once={false} className="flex flex-wrap gap-4 items-end justify-between mb-10">
            <h2 className="font-serif text-4xl">The collection</h2>
            <Link to="/designs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse every design →
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(designs ?? []).slice(0, 6).map((d: any, i: number) => {
              const img = d.image_url ?? d.image_urls?.[0] ?? null;
              return (
                <Reveal key={d.id} once={false} variant={i % 3 === 1 ? "scale" : "up"} delay={(i % 3) * 120}>
                <Link
                  to="/designs/$id"
                  params={{ id: d.id }}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="aspect-[4/5] bg-secondary overflow-hidden">
                    {img ? (
                      <img src={img} alt={d.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Leaf className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {d.category && (
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{d.category}</p>
                    )}
                    <h3 className="font-serif text-xl mt-1">{d.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {hidePrices ? <HiddenPriceText /> : `$${Number(d.price).toFixed(2)}`}
                    </p>
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}