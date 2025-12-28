import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPizzaImage } from "@/utils/imageHelper";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image_url: string | null;
  is_vegetarian: boolean;
  category: string;
  available: boolean;
}

export interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  isVegetarian?: boolean;
  category?: string;
  available?: boolean;
  blockedBy?: string;
}

export function useMenuItems() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to check blocked ingredients
  const checkAvailability = (item: MenuItem, blockedIngredients: string[]): boolean => {
    // If manually unavailable, keep it unavailable
    if (item.available === false) return false;

    // Check if any blocked ingredient is in name or description
    const textToCheck = `${item.name} ${item.description}`.toLowerCase();

    return !blockedIngredients.some(blocked => textToCheck.includes(blocked.toLowerCase()));
  };

  const formatMenuItem = (item: MenuItem, blockedIngredients: string[] = []): Pizza => {
    const isAvailable = checkAvailability(item, blockedIngredients);

    // Find which ingredient is blocked (just for display purposes if needed, logic is simple here)
    const blockedBy = blockedIngredients.find(blocked =>
      `${item.name} ${item.description}`.toLowerCase().includes(blocked.toLowerCase())
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      ingredients: item.ingredients || [],
      price: item.price,
      image: getPizzaImage(item.image_url, item.name),
      isVegetarian: item.is_vegetarian,
      category: item.category,
      available: isAvailable,
      blockedBy: blockedBy // Optional: Add this to Pizza interface to show specific blocking reason
    };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Menu Items
        const { data: menuData, error: menuError } = await supabase
          .from("menu_items")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (menuError) throw menuError;

        // 2. Fetch Blocked Ingredients
        const { data: stockData, error: stockError } = await supabase
          .from("unavailable_ingredients")
          .select("name");

        if (stockError) throw stockError;

        const blockedIngredients = (stockData || []).map(i => i.name);

        // 3. Merge and Format
        const formattedPizzas: Pizza[] = (menuData || []).map(item => formatMenuItem(item, blockedIngredients));
        setPizzas(formattedPizzas);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erro ao carregar o menu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Subscribe to BOTH tables
    const channel1 = supabase
      .channel("menu-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => fetchData())
      .subscribe();

    const channel2 = supabase
      .channel("stock-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "unavailable_ingredients" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  return { pizzas, loading, error };
}
