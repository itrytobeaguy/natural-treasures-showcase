import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact | Natural Treasures" },
      { name: "description", content: "Get in touch with Natural Treasures." },
      { property: "og:title", content: "Contact | Natural Treasures" },
      { property: "og:description", content: "Get in touch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal as="h1" variant="blur" className="font-serif text-5xl">Reach out</Reveal>
      <Reveal as="p" delay={120} className="mt-6 text-muted-foreground leading-relaxed max-w-xl">
        Contact us if you have an order, if you have any inquiries about designs, sizing, or anything else.
      </Reveal>
      <Reveal delay={240} className="mt-10 space-y-4 text-lg">
        <a href="mailto:naturaltreasuresclothing@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
          <Mail className="h-5 w-5" /> naturaltreasuresclothing@gmail.com
        </a>
      </Reveal>
    </section>
  );
}