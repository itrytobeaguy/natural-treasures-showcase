import { createFileRoute } from "@tanstack/react-router";
import { Mail, Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Natural Treasures" },
      { name: "description", content: "Get in touch with Natural Treasures." },
      { property: "og:title", content: "Contact — Natural Treasures" },
      { property: "og:description", content: "Get in touch." },
    ],
  }),
});

function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-serif text-5xl">Say hello</h1>
      <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl">
        For custom pieces, questions about sizing, or anything else — reach out. We reply as soon as
        we can.
      </p>
      <div className="mt-10 space-y-4 text-lg">
        <a href="mailto:niktapo31@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
          <Mail className="h-5 w-5" /> niktapo31@gmail.com
        </a>
        <p className="flex items-center gap-3 text-muted-foreground">
          <Instagram className="h-5 w-5" /> @naturaltreasures
        </p>
      </div>
    </section>
  );
}