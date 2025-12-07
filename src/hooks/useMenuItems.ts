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
}

export function useMenuItems() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatMenuItem = (item: MenuItem): Pizza => ({
    id: item.id,
    name: item.name,
    description: item.description,
    ingredients: item.ingredients || [],
    price: item.price,
    image: getPizzaImage(item.image_url, item.name),
    isVegetarian: item.is_vegetarian,
    category: item.category,
    available: item.available !== false,
  });

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        const formattedPizzas: Pizza[] = (data || []).map(formatMenuItem);
        setPizzas(formattedPizzas);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Erro ao carregar o cardápio");
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("menu-items-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "menu_items",
        },
        (payload) => {
          console.log("Menu item updated:", payload);
          const updatedItem = payload.new as MenuItem;
          setPizzas((prev) =>
            prev.map((pizza) =>
              pizza.id === updatedItem.id ? formatMenuItem(updatedItem) : pizza
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { pizzas, loading, error };
}
