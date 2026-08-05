import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRICE_HIDDEN_TEXT = "Please contact Natural Treasures for the price";
export const CONTACT_EMAIL = "naturaltreasuresclothing@gmail.com";

export function useHidePrices() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("hide_prices")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
  return !!data?.hide_prices;
}

export function HiddenPriceText({ className }: { className?: string }) {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=Inquiry about a Natural Treasures design`}
      className={`underline underline-offset-4 hover:text-primary transition-colors ${className ?? ""}`}
    >
      {PRICE_HIDDEN_TEXT}
    </a>
  );
}
