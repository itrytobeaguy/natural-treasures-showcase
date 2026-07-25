import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Leaf, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/designs_/$id")({
  component: DesignDetail,
  head: ({ params }) => ({
    meta: [
      { title: `Design — Natural Treasures` },
      { name: "description", content: "View design details and place an order." },
      { property: "og:title", content: `Design ${params.id}` },
    ],
  }),
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(1, "Name required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  shipping_address: z.string().trim().min(5, "Shipping address required").max(500),
  size: z.string().trim().min(1, "Size required").max(20),
});

function DesignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: design, isLoading } = useQuery({
    queryKey: ["design", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("designs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ customer_name: "", customer_email: "", shipping_address: "", size: "" });
  const [submitting, setSubmitting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from("orders").insert({
      ...parsed.data,
      design_id: id,
      user_id: sess.user?.id ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not place order. Please try again.");
      return;
    }
    toast.success("Order placed! We'll be in touch by email shortly.");
    setForm({ customer_name: "", customer_email: "", shipping_address: "", size: "" });
    navigate({ to: "/designs" });
  }

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-muted-foreground">Loading…</div>;
  }
  if (!design) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-muted-foreground">Design not found.</p>
        <Link to="/designs" className="text-primary underline">Back to designs</Link>
      </div>
    );
  }

  const images: string[] = [
    ...(design.image_url ? [design.image_url] : []),
    ...((design.image_urls as string[] | null) ?? []),
  ].filter(Boolean);
  const current = images[imgIdx % Math.max(images.length, 1)];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Link to="/designs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
        <ArrowLeft className="h-4 w-4" /> All designs
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-border group">
            {current ? (
              <img src={current} alt={design.title} className="w-full h-full object-cover transition-opacity duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Leaf className="h-14 w-14 opacity-40" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-background transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-background transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      aria-label={`Image ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-6 bg-primary" : "w-1.5 bg-background/80 border border-border"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all ${i === imgIdx ? "border-primary ring-2 ring-primary/30" : "border-border opacity-70 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {design.category && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{design.category}</p>
          )}
          <h1 className="font-serif text-4xl mt-2">{design.title}</h1>
          <p className="mt-4 text-2xl">${Number(design.price).toFixed(2)}</p>
          {design.description && (
            <p className="mt-6 text-muted-foreground leading-relaxed">{design.description}</p>
          )}

          <form onSubmit={submit} className="mt-10 space-y-4">
            <h2 className="font-serif text-2xl">Order now</h2>
            <Field label="Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
            <Field label="Email" type="email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} />
            <Field label="Size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} placeholder="e.g. M" />
            <Field label="Shipping address" value={form.shipping_address} onChange={(v) => setForm({ ...form, shipping_address: v })} textarea />
            <button
              type="submit"
              disabled={submitting || !design.in_stock}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {!design.in_stock ? "Currently unavailable" : submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="text-xs text-muted-foreground">
              You'll receive a confirmation email. We ship pieces manually — please allow a few days.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  const Cmp: any = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <Cmp
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={textarea ? 3 : undefined}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}