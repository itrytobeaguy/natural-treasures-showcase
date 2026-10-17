import { displayText } from "@/lib/display-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useHidePrices, HiddenPriceText } from "@/hooks/useHidePrices";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

import { ProductCarousel } from "@/components/ProductCarousel";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Wear the Wild | Natural Treasures" },
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
  const { data: designs, isLoading, isError } = useQuery({
    queryKey: ["featured-designs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("designs")
        .select("id, title, price, image_url, image_urls, category, collection, in_stock")
        .eq("is_hidden", false).eq("in_stock", true);
      if (error) throw error;
      return data ?? [];
    },
  });
  const images = useMemo(() => {
    const pool = (designs ?? []).flatMap((design) => [...new Set([
      ...(design.image_url ? [design.image_url] : []), ...(design.image_urls ?? []),
    ])].filter(Boolean).map((image) => ({ id: design.id, title: displayText(design.title), collection: displayText(design.collection) || null, image })));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 15);
  }, [designs]);

  return (
    <div>
      {isLoading && <div className="carousel-loading animate-pulse bg-secondary" aria-label="Loading product images" />}
      <ProductCarousel images={images} />
      <section className="wild-title-section flex flex-col items-center py-14 text-center sm:py-16 lg:py-20">
        <Reveal as="h1" variant="blur" className="nature-headline wild-title font-serif text-foreground">
          <span className="headline-line">Wear the Wild</span>
        </Reveal>
        <Reveal delay={150} className="mt-6">
          <Button asChild variant="ghost" className="h-12 rounded-none px-6 text-base hover:bg-transparent hover:text-primary"><Link to="/designs">Explore the collection <ArrowUpRight /></Link></Button>
        </Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-12">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">The collection</h2>
          <Link to="/designs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">All products ↗</Link>
        </Reveal>
        {isError && <p className="text-muted-foreground">The collection could not load. Please refresh to try again.</p>}
        {!isLoading && !isError && !designs?.length && <p className="text-muted-foreground">New pieces are coming soon.</p>}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(designs ?? []).slice(0, 6).map((design, i) => {
            const image = design.image_url || design.image_urls?.[0];
            return <Reveal key={design.id} delay={(i % 3) * 100} className="h-full">
              <Link to="/designs/$id" params={{ id: design.id }} className="product-card group flex h-full flex-col">
                <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-secondary">
                  {image ? <img src={image} alt={displayText(design.title)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Leaf className="h-10 w-10" /></div>}
                </div>
                <div className="product-info flex flex-1 flex-col border-t border-border pt-4">
                  <h3 className="product-title line-clamp-2 text-lg">{displayText(design.title)}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{[design.category, design.collection].filter(Boolean).map(displayText).join(" · ") || "\u00a0"}</p>
                  <p className="mt-auto pt-4 text-sm text-muted-foreground">{hidePrices ? <HiddenPriceText /> : `$${Number(design.price).toFixed(2)}`}</p>
                </div>
              </Link>
            </Reveal>;
          })}
        </div>
      </section>
    </div>
  );
}
