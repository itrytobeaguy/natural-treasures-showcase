import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useHidePrices, HiddenPriceText } from "@/hooks/useHidePrices";
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
        <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary">
          <img
            src={heroImage.url}
            alt="Model wearing the Yosemite National Park tee from Natural Treasures in a misty pine forest"
            width={1280}
            height={1600}
            className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/25" />
          <div className="relative px-7 py-20 sm:px-14 sm:py-28 lg:py-36 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8 animate-fade-in">
              <Leaf className="h-3.5 w-3.5" /> All Natural — grown slowly, worn gently
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.03] text-foreground animate-fade-in">
              Breathe Natural.
              <br />
              <em className="italic text-primary">Stay Comfortable.</em>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in">
              It starts in a field, not a factory. Linen, cotton and hemp, cut by hand and finished in
              small batches — so what touches your skin still remembers where it came from. Soft on the
              first morning. Softer on the thousandth.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/designs"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Explore the collection
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-border bg-background/60 backdrop-blur-sm px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Tell us your story
              </Link>
            </div>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
            {featured.slice(0, 3).map((d: any) => {
              const img = d.image_url ?? d.image_urls?.[0] ?? null;
              return (
                <Link
                  key={d.id}
                  to="/designs/$id"
                  params={{ id: d.id }}
                  className="group block rounded-2xl overflow-hidden border border-border bg-secondary transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="aspect-[4/5]">
                    {img ? (
                      <img
                        src={img}
                        alt={d.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Leaf className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { t: "Natural fibers", d: "Linen, cotton, hemp — chosen for how they age.", img: cardFibers, alt: "Person wearing a natural linen tee in a field of tall grass" },
            { t: "Small batches", d: "Every piece is made in limited quantity, by hand.", img: cardBatches, alt: "Person wearing a sage cotton sweatshirt among misty pines" },
            { t: "Made to order", d: "Order what you love and we send it directly to you.", img: cardMadeToOrder, alt: "Two people wearing natural cotton tees walking a forest trail" },
          ].map((f) => (
            <div
              key={f.t}
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
            </div>
          ))}
        </div>
      </section>

      {(designs?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-4xl">The collection</h2>
            <Link to="/designs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse every design →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(designs ?? []).slice(0, 6).map((d: any) => {
              const img = d.image_url ?? d.image_urls?.[0] ?? null;
              return (
                <Link
                  key={d.id}
                  to="/designs/$id"
                  params={{ id: d.id }}
                  className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-lg"
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
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}