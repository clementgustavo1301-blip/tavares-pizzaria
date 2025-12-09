{ Dport ialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Pizza } from "@/data/pizzas"; // Using shared type
import { useOrder } from "@/context/OrderContext";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getPizzaImage } from "@/utils/imageHelper";

interface DrinksUpsellModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinue: () => void;
}

export function DrinksUpsellModal({ open, onOpenChange, onContinue }: DrinksUpsellModalProps) {
    const [drinks, setDrinks] = useState<Pizza[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useOrder();
    const [addedDrink, setAddedDrink] = useState(false);

    useEffect(() => {
        if (open) {
            fetchDrinks();
        }import { useEffect, useState } from "react";
im
    }, [open]);

    const fetchDrinks = async () => {
        try {
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("category", "Bebidas") // Ensure this matches your DB value
                .eq("available", true);

            if (error) throw error;

            const formattedDrinks: Pizza[] = (data || []).map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description || "",
                ingredients: [],
                price: item.price,
                image: getPizzaImage(item.image_url, item.name),
                category: item.category,
            }));

            setDrinks(formattedDrinks);
        } catch (err) {
            console.error("Error fetching drinks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDrink = (drink: Pizza) => {
        addToCart(drink);
        toast.success(`${drink.name} adicionado!`);
        setAddedDrink(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif text-center">
                        Que tal uma bebida gelada? 🥤
                    </DialogTitle>
                    <p className="text-center text-muted-foreground text-sm">
                        Complete seu pedido com nossos refrescos
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : drinks.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhuma bebida encontrada.</p>
                    ) : (
                        <div className="space-y-3">
                            {drinks.map((drink) => (
                                <div
                                    key={drink.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                                >
                                    <img
                                        src={drink.image}
                                        alt={drink.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm">{drink.name}</h4>
                                        <p className="text-primary font-bold text-sm">
                                            R$ {drink.price.toFixed(2).replace(".", ",")}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleAddDrink(drink)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button className="w-full" size="lg" onClick={onContinue}>
                        {addedDrink ? "Continuar para Pagamento" : "Não, obrigado. Seguir para Pagamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
