import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  is_vegetarian: boolean;
  category: string;
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
}

export function useMenuItems() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        const formattedPizzas: Pizza[] = (data || []).map((item: MenuItem) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          ingredients: item.ingredients || [],
          price: item.price,
          image: item.image,
          isVegetarian: item.is_vegetarian,
          category: item.category,
        }));

        setPizzas(formattedPizzas);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Erro ao carregar o cardápio");
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, []);

  return { pizzas, loading, error };
}
