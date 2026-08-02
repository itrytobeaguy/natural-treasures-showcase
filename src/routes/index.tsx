import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useHidePrices, PRICE_HIDDEN_TEXT } from "@/hooks/useHidePrices";

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
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {featured.length > 0 && (
            <div className="relative hidden lg:flex items-center justify-center h-[26rem]">
              {featured.slice(0, 3).map((d: any, i: number) => {
                const img = d.image_url ?? d.image_urls?.[0] ?? null;
                const offsets = [
                  { top: "0%", left: "5%", rotate: "-6deg", z: 30, w: "w-52" },
                  { top: "22%", left: "38%", rotate: "4deg", z: 20, w: "w-48" },
                  { top: "52%", left: "12%", rotate: "-3deg", z: 10, w: "w-44" },
                ];
                const o = offsets[i] ?? offsets[0];
                return (
                  <Link
                    key={d.id}
                    to="/designs/$id"
                    params={{ id: d.id }}
                    className="group absolute block will-change-transform"
                    style={{ top: o.top, left: o.left, transform: `rotate(${o.rotate})`, zIndex: o.z }}
                  >
                    <div className={`${o.w} aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-border shadow-xl transition-all duration-300 group-hover:scale-[1.06] group-hover:rotate-0 group-hover:border-primary/40 group-hover:shadow-2xl`}>
                      {img ? (
                        <img
                          src={img}
                          alt={d.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Leaf className="h-10 w-10 opacity-40" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
              <Leaf className="h-3.5 w-3.5" /> Natural Treasures
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl leading-[1.05] text-foreground">
              Clothing that <em className="italic text-primary">breathes</em> with the seasons.
            </h1>
            <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
              A small, slow collection of pieces made from natural fibers — designed to be worn quietly,
              for a long time.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                to="/designs"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View designs
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { t: "Natural fibers", d: "Linen, cotton, hemp — chosen for how they age." },
            { t: "Small batches", d: "Every piece is made in limited quantity, by hand." },
            { t: "Made to order", d: "Order what you love and we send it directly to you." },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:scale-[1.03] hover:bg-accent/40 hover:border-primary/40 hover:shadow-lg"
            >
              <h3 className="font-serif text-2xl">{f.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}