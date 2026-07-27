import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRICE_HIDDEN_TEXT = "Please contact Natural Treasures for the price";

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