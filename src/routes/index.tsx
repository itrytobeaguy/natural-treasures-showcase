import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

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
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-32">
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