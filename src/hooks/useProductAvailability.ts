import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AvailabilityStatus {
    available: boolean;
    reason?: string;
    blockedIngredient?: string;
}

export function useProductAvailability() {
    const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnavailableIngredients();

        const channel = supabase
            .channel("availability-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "unavailable_ingredients",
                },
                () => {
                    fetchUnavailableIngredients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUnavailableIngredients = async () => {
        try {
            const { data, error } = await supabase
                .from("unavailable_ingredients")
                .select("name");

            if (error) throw error;
            setUnavailableIngredients((data || []).map((i) => i.name.toLowerCase()));
        } catch (error) {
            console.error("Error fetching unavailable ingredients:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = (
        productName: string,
        productDescription: string | null
    ): AvailabilityStatus => {
        const textToCheck = `${productName} ${productDescription || ""}`.toLowerCase();

        const blockedIngredient = unavailableIngredients.find((ingredient) =>
            textToCheck.includes(ingredient)
        );

        if (blockedIngredient) {
            return {
                available: false,
                reason: `Sem ${blockedIngredient.charAt(0).toUpperCase() + blockedIngredient.slice(1)}`,
                blockedIngredient: blockedIngredient,
            };
        }

        return { available: true };
    };

    return {
        unavailableIngredients,
        loading,
        checkAvailability,
    };
}
