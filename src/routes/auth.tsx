import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Account — Natural Treasures" },
      { name: "description", content: "Sign in or create an account." },
      { property: "og:title", content: "Account — Natural Treasures" },
      { property: "og:description", content: "Sign in or create an account." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<null | { email?: string }>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setSignedIn({ email: data.user.email });
    });
  }, []);

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed");
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success("Account created! You're signed in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else {
        toast.success("Welcome back");
        navigate({ to: "/" });
      }
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSignedIn(null);
    toast.success("Signed out");
  }

  if (signedIn) {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-serif text-4xl">Signed in</h1>
        <p className="mt-4 text-muted-foreground">{signedIn.email}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/designs" className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm">
            Browse designs
          </Link>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="font-serif text-4xl">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Optional — order without an account any time.</p>

      <button
        onClick={handleGoogle}
        className="mt-8 w-full rounded-full border border-border bg-background py-3 text-sm font-medium hover:bg-secondary transition-colors"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleEmail} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </section>
  );
}