import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/designs")({
  component: DesignsPage,
  head: () => ({
    meta: [
      { title: "Designs — Natural Treasures" },
      { name: "description", content: "Browse the current collection of Natural Treasures pieces." },
      { property: "og:title", content: "Designs — Natural Treasures" },
      { property: "og:description", content: "Browse the current collection." },
    ],
  }),
});

type Design = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
  in_stock: boolean;
};

function DesignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["designs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("designs")
        .select("id, title, price, image_url, image_urls, category, in_stock")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Design[];
    },
  });

  const [active, setActive] = useState<string>("All");
  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((d) => d.category && set.add(d.category));
    return ["All", ...Array.from(set).sort()];
  }, [data]);
  const filtered = useMemo(
    () => (active === "All" ? data ?? [] : (data ?? []).filter((d) => d.category === active)),
    [data, active],
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-14 max-w-xl">
        <h1 className="font-serif text-5xl">The collection</h1>
        <p className="mt-4 text-muted-foreground">
          Each piece is made in small quantities. Tap one to see details and place an order.
        </p>
      </div>

      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full">No designs in this category yet.</p>
          )}
          {filtered.map((d) => (
            <Link
              key={d.id}
              to="/designs/$id"
              params={{ id: d.id }}
              className="group block"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-border relative transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-accent/50 group-hover:border-primary/40 group-hover:shadow-lg">
                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt={d.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Leaf className="h-10 w-10 opacity-40" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-baseline">
                <div>
                  <h3 className="font-serif text-xl">{d.title}</h3>
                  {d.category && (
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      {d.category}
                    </p>
                  )}
                </div>
                <p className="text-sm">${Number(d.price).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}