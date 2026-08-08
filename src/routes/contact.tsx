import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Reveal } from "@/components/Reveal";

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
      <Reveal as="h1" variant="blur" className="font-serif text-5xl">Say hello</Reveal>
      <Reveal as="p" delay={120} className="mt-6 text-muted-foreground leading-relaxed max-w-xl">
        For custom pieces, questions about sizing, or anything else — reach out. We reply as soon as
        we can.
      </Reveal>
      <Reveal delay={240} className="mt-10 space-y-4 text-lg">
        <a href="mailto:naturaltreasuresclothing@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
          <Mail className="h-5 w-5" /> naturaltreasuresclothing@gmail.com
        </a>
      </Reveal>
    </section>
  );
}