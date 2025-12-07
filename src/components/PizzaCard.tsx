import { Plus, Leaf, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza } from "@/hooks/useMenuItems";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const { addToCart } = useOrder();
  const isAvailable = pizza.available !== false;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(pizza);
    toast.success("Pizza adicionada!", {
      description: `${pizza.name} - R$ ${pizza.price.toFixed(2).replace(".", ",")}`,
      duration: 2000,
    });
  };

  return (
    <Card className={`group overflow-hidden card-rustic transition-all duration-300 animate-fade-in ${isAvailable ? "hover:shadow-elevated hover:-translate-y-1" : "opacity-75"}`}>
      <div className="relative overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className={`w-full h-52 object-cover transition-transform duration-500 ${isAvailable ? "group-hover:scale-105" : "grayscale"}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Sold Out Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <Badge className="bg-destructive text-destructive-foreground gap-1 text-lg px-4 py-2 shadow-lg">
              <Ban className="h-5 w-5" />
              Esgotado
            </Badge>
          </div>
        )}
        
        {pizza.isVegetarian && isAvailable && (
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground gap-1 shadow-md">
            <Leaf className="h-3 w-3" />
            Vegetariana
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold shadow-lg">
          R$ {pizza.price.toFixed(2).replace(".", ",")}
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {pizza.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {pizza.description}
        </p>
        
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          <span className="font-semibold text-foreground/70">Ingredientes:</span>{" "}
          {pizza.ingredients.join(", ")}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full group/btn"
          variant="default"
          disabled={!isAvailable}
        >
          {isAvailable ? (
            <>
              <Plus className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-200" />
              Adicionar ao Carrinho
            </>
          ) : (
            <>
              <Ban className="h-4 w-4 mr-2" />
              Indisponível
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
