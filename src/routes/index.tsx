import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useHidePrices, HiddenPriceText } from "@/hooks/useHidePrices";
import { Reveal } from "@/components/Reveal";
import { useParallax } from "@/hooks/useParallax";
import heroImage from "@/assets/hero-natural.jpg.asset.json";
import cardFibers from "@/assets/card-fibers.jpg.asset.json";
import cardBatches from "@/assets/card-batches.jpg.asset.json";
import cardMadeToOrder from "@/assets/card-madetoorder.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Natural Treasures — Nature-inspired clothing" },
      { name: "description", content: "Quietly made clothing rooted in nature. Discover our current pieces." },
      { property: "og:title", content: "Natural Treasures" },
      { property: "og:description", content: "Quietly made clothing rooted in nature." },
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
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-28">
        <div ref={hero.ref} className="relative overflow-hidden rounded-3xl border border-border bg-secondary">
          <img
            src={heroImage.url}
            alt="Model wearing the Yosemite National Park tee from Natural Treasures in a misty pine forest"
            width={1280}
            height={1600}
            style={{ transform: `translate3d(0, ${hero.offset}px, 0) scale(1.12)` }}
            className="absolute inset-0 h-full w-full object-cover object-[70%_center] will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
          <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 px-7 py-20 sm:px-14 sm:py-28 lg:py-24 items-center">
            <div className="max-w-xl">
              <Reveal variant="blur" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
                <Leaf className="h-3.5 w-3.5" /> All Natural — grown slowly, worn gently
              </Reveal>
              <Reveal as="h1" delay={100} className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.03] text-foreground">
                Breathe Natural.
                <br />
                <em className="italic text-primary">Stay Comfortable.</em>
              </Reveal>
              <Reveal as="p" delay={220} className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-lg">
                It starts in a field, not a factory. Linen, cotton and hemp, cut by hand and finished in
                small batches — so what touches your skin still remembers where it came from. Soft on the
                first morning. Softer on the thousandth.
              </Reveal>
              <Reveal delay={340} className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/designs"
                  className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Explore the collection
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full border border-border bg-background/60 backdrop-blur-sm px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:-translate-y-0.5"
                >
                  Tell us your story
                </Link>
              </Reveal>
            </div>

            {featured.length > 0 && (
              <div className="relative flex flex-col items-center justify-center h-full min-h-[320px] lg:min-h-[420px] py-4">
                {featured.slice(0, 3).map((d: any, i: number) => {
                  const img = d.image_url ?? d.image_urls?.[0] ?? null;
                  const rotations = ["-2deg", "2deg", "-1deg"];
                  const offsets = ["0", "-2rem", "-2rem"];
                  const zIndexes = [10, 20, 30];
                  return (
                    <Reveal
                      key={d.id}
                      variant="scale"
                      delay={i * 120}
                      className="w-40 sm:w-44 lg:w-52 aspect-square"
                      style={{
                        marginTop: i === 0 ? "0" : "-2rem",
                        transform: `rotate(${rotations[i]})`,
                        zIndex: zIndexes[i],
                      }}
                    >
                      <Link
                        to="/designs/$id"
                        params={{ id: d.id }}
                        className="group relative block h-full w-full rounded-2xl overflow-hidden border border-border bg-secondary shadow-lg transition-all duration-300 hover:scale-[1.06] hover:z-50 hover:rotate-0 hover:shadow-xl"
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-32">
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
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:scale-[1.03] hover:bg-accent/40 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={f.img.url}
                  alt={f.alt}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl">{f.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {(designs?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <Reveal className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-4xl">The collection</h2>
            <Link to="/designs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse every design →
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(designs ?? []).slice(0, 6).map((d: any, i: number) => {
              const img = d.image_url ?? d.image_urls?.[0] ?? null;
              return (
                <Reveal key={d.id} variant="up" delay={(i % 3) * 120}>
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