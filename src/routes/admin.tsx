import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useHidePrices } from "@/hooks/useHidePrices";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Natural Treasures" },
      { name: "description", content: "Admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function check() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (!data.user) {
      setIsAdmin(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    setIsAdmin(!!roles && roles.length > 0);
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  if (isAdmin === null) {
    return <div className="mx-auto max-w-md px-6 py-24 text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-serif text-4xl">Admin sign in</h1>
        <p className="mt-3 text-sm text-muted-foreground">Restricted to shop admins.</p>
        <form onSubmit={signIn} className="mt-8 space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
          <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {loading ? "…" : "Sign in"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <button
          onClick={signInWithGoogle}
          className="w-full rounded-full border border-border bg-background py-3 text-sm font-medium hover:border-primary/40"
        >
          Continue with Google
        </button>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-serif text-3xl">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">Signed in as {user.email}, but you don't have admin access.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          To grant admin access: open the backend, go to the <code>user_roles</code> table, and insert a row with your user_id and role <code>admin</code>.
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={signOut} className="rounded-full border border-border px-5 py-2.5 text-sm">Sign out</button>
          <Link to="/" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">Home</Link>
        </div>
      </section>
    );
  }

  return <AdminDashboard onSignOut={signOut} email={user.email} />;
}

function AdminDashboard({ onSignOut, email }: { onSignOut: () => void; email: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"orders" | "designs">("orders");
  const hidePrices = useHidePrices();

  async function toggleHidePrices() {
    const { error } = await supabase
      .from("site_settings")
      .update({ hide_prices: !hidePrices, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) return toast.error(error.message);
    toast.success(!hidePrices ? "Prices hidden site-wide" : "Prices are visible");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  }

  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, designs(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const designs = useQuery({
    queryKey: ["admin-designs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("designs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const newCount = orders.data?.filter((o: any) => o.status === "new").length ?? 0;

  async function markShipped(id: string) {
    const { error } = await supabase.from("orders").update({ status: "shipped" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked as shipped");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleHidePrices}
            aria-pressed={hidePrices}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              hidePrices
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${hidePrices ? "bg-primary-foreground" : "bg-muted-foreground/50"}`} />
            {hidePrices ? "Prices hidden" : "Hide prices"}
          </button>
          <button onClick={onSignOut} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-border">
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>
          Orders {newCount > 0 && <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-5 min-w-5 px-1.5">{newCount}</span>}
        </TabBtn>
        <TabBtn active={tab === "designs"} onClick={() => setTab("designs")}>Designs</TabBtn>
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.isLoading && <p className="text-muted-foreground">Loading…</p>}
          {orders.data?.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
          {orders.data?.map((o: any) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium">{o.customer_name} — <span className="text-muted-foreground font-normal">{o.designs?.title ?? "—"}</span></p>
                  <p className="text-sm text-muted-foreground mt-1">{o.customer_email} · Size {o.size}</p>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{o.shipping_address}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${o.status === "new" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {o.status}
                  </span>
                  {o.status === "new" && (
                    <button onClick={() => markShipped(o.id)} className="text-xs text-primary hover:underline">
                      Mark shipped
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "designs" && (
        <DesignsAdmin designs={designs.data ?? []} onChange={() => qc.invalidateQueries({ queryKey: ["admin-designs"] })} />
      )}
    </section>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm border-b-2 transition-colors ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function DesignsAdmin({ designs, onChange }: { designs: any[]; onChange: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [coll, setColl] = useState("All");
  const [stock, setStock] = useState<"all" | "in" | "out">("all");
  const qc2 = useQueryClient();
  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("name").order("name");
      if (error) throw error;
      return data.map((c: any) => c.name as string);
    },
  });
  const collectionNames = useMemo(() => {
    const set = new Set<string>(collectionsQuery.data ?? []);
    designs.forEach((d) => d.collection && set.add(d.collection));
    return Array.from(set).sort();
  }, [collectionsQuery.data, designs]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    designs.forEach((d) => d.category && set.add(d.category));
    return ["All", ...Array.from(set).sort()];
  }, [designs]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return designs.filter((d) => {
      if (cat !== "All" && d.category !== cat) return false;
      if (coll !== "All" && d.collection !== coll) return false;
      if (stock === "in" && !d.in_stock) return false;
      if (stock === "out" && d.in_stock) return false;
      if (term && !`${d.title ?? ""} ${d.category ?? ""} ${d.collection ?? ""} ${d.description ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [designs, q, cat, coll, stock]);

  async function save(d: any) {
    const extraImages: string[] = (d.image_urls_text ?? "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const payload = {
      title: d.title,
      description: d.description,
      price: Number(d.price),
      image_url: d.image_url || null,
      image_urls: extraImages,
      category: d.category,
      collection: d.collection?.trim() ? d.collection.trim() : null,
      in_stock: d.in_stock,
      sort_order: Number(d.sort_order) || 0,
    };
    if (payload.collection && !collectionNames.includes(payload.collection)) {
      const { error: cErr } = await supabase.from("collections").insert({ name: payload.collection });
      if (cErr && !cErr.message.includes("duplicate")) return toast.error(cErr.message);
      qc2.invalidateQueries({ queryKey: ["collections"] });
    }
    if (d.id) {
      const { error } = await supabase.from("designs").update(payload).eq("id", d.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("designs").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this design?")) return;
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); onChange(); }
  }

  if (editing) {
    const editingWithText = {
      ...editing,
      image_urls_text:
        editing.image_urls_text ??
        (Array.isArray(editing.image_urls) ? editing.image_urls.join("\n") : ""),
    };
    return (
      <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
        <h2 className="font-serif text-2xl mb-4">{editing.id ? "Edit design" : "New design"}</h2>
        <div className="space-y-3">
          <Input label="Title" value={editingWithText.title ?? ""} onChange={(v) => setEditing({ ...editingWithText, title: v })} />
          <CategoryInput value={editingWithText.category ?? ""} onChange={(v) => setEditing({ ...editingWithText, category: v })} />
          <CollectionInput
            value={editingWithText.collection ?? ""}
            options={collectionNames}
            onChange={(v) => setEditing({ ...editingWithText, collection: v })}
          />
          <Input label="Price" type="number" value={String(editingWithText.price ?? 0)} onChange={(v) => setEditing({ ...editingWithText, price: v })} />
          <Input label="Primary image URL (shown first)" value={editingWithText.image_url ?? ""} onChange={(v) => setEditing({ ...editingWithText, image_url: v })} />
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Additional images / mockups (one URL per line)</span>
            <textarea
              rows={4}
              value={editingWithText.image_urls_text}
              onChange={(e) => setEditing({ ...editingWithText, image_urls_text: e.target.value })}
              placeholder={"https://…/mockup-front.jpg\nhttps://…/mockup-back.jpg"}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </label>
          <Input label="Sort order" type="number" value={String(editingWithText.sort_order ?? 0)} onChange={(v) => setEditing({ ...editingWithText, sort_order: v })} />
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Description</span>
            <textarea rows={3} value={editingWithText.description ?? ""} onChange={(e) => setEditing({ ...editingWithText, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editingWithText.in_stock ?? true} onChange={(e) => setEditing({ ...editingWithText, in_stock: e.target.checked })} />
            In stock
          </label>
          <div className="flex gap-2 pt-3">
            <button onClick={() => save(editingWithText)} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">Save</button>
            <button onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => setEditing({ title: "", price: 0, in_stock: true, sort_order: designs.length + 1 })} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">
          + New design
        </button>
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
          <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-full transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>List</button>
          <button onClick={() => setView("grid")} className={`px-3 py-1.5 rounded-full transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Grid</button>
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search designs…"
            aria-label="Search designs"
            className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
          ))}
        </select>
        <select value={coll} onChange={(e) => setColl(e.target.value)} aria-label="Filter by collection" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">
          <option value="All">All collections</option>
          {collectionNames.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value as typeof stock)} aria-label="Filter by availability" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">
          <option value="all">All availability</option>
          <option value="in">In stock</option>
          <option value="out">Unavailable</option>
        </select>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{filtered.length} of {designs.length} designs</p>
      {view === "list" ? (
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {d.image_url ? <img src={d.image_url} alt={d.title} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                </div>
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">${Number(d.price).toFixed(2)} · {d.category ?? "—"} · {d.collection ?? "no collection"} · {d.in_stock ? "in stock" : "unavailable"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(d)} className="text-sm text-primary hover:underline">Edit</button>
                <button onClick={() => remove(d.id)} className="text-sm text-destructive hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-square bg-secondary overflow-hidden">
                {d.image_url ? <img src={d.image_url} alt={d.title} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">${Number(d.price).toFixed(2)} · {d.category ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{d.collection ?? "no collection"}</p>
                <p className="text-xs text-muted-foreground">{d.in_stock ? "in stock" : "unavailable"}</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setEditing(d)} className="text-xs text-primary hover:underline">Edit</button>
                  <button onClick={() => remove(d.id)} className="text-xs text-destructive hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}

const PRESET_CATEGORIES = ["T-Shirts", "Sweatshirts/Hoodies", "Shorts", "Pants"];

function CategoryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Category</span>
      <div className="mt-1 flex flex-wrap gap-1.5 mb-2">
        {PRESET_CATEGORIES.map((c) => {
          const active = value === c;
          return (
            <button
              type="button"
              key={c}
              onClick={() => onChange(c)}
              className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
      <input
        list="preset-categories"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pick a preset above or type your own"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <datalist id="preset-categories">
        {PRESET_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </label>
  );
}