import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        <button onClick={onSignOut} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
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

  async function save(d: any) {
    const payload = {
      title: d.title,
      description: d.description,
      price: Number(d.price),
      image_url: d.image_url || null,
      category: d.category,
      in_stock: d.in_stock,
      sort_order: Number(d.sort_order) || 0,
    };
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
    return (
      <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
        <h2 className="font-serif text-2xl mb-4">{editing.id ? "Edit design" : "New design"}</h2>
        <div className="space-y-3">
          <Input label="Title" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
          <Input label="Category" value={editing.category ?? ""} onChange={(v) => setEditing({ ...editing, category: v })} />
          <Input label="Price" type="number" value={String(editing.price ?? 0)} onChange={(v) => setEditing({ ...editing, price: v })} />
          <Input label="Image URL (leave blank for placeholder)" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
          <Input label="Sort order" type="number" value={String(editing.sort_order ?? 0)} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Description</span>
            <textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.in_stock ?? true} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} />
            In stock
          </label>
          <div className="flex gap-2 pt-3">
            <button onClick={() => save(editing)} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">Save</button>
            <button onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setEditing({ title: "", price: 0, in_stock: true, sort_order: designs.length + 1 })} className="mb-6 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">
        + New design
      </button>
      <div className="space-y-2">
        {designs.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">${Number(d.price).toFixed(2)} · {d.category ?? "—"} · {d.in_stock ? "in stock" : "unavailable"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(d)} className="text-sm text-primary hover:underline">Edit</button>
              <button onClick={() => remove(d.id)} className="text-sm text-destructive hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
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