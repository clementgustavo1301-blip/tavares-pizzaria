import { Plus, Leaf } from "lucide-react";
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

  const handleAddToCart = () => {
    addToCart(pizza);
    toast.success("Pizza adicionada!", {
      description: `${pizza.name} - R$ ${pizza.price.toFixed(2).replace(".", ",")}`,
      duration: 2000,
    });
  };

  return (
    <Card className="group overflow-hidden card-rustic hover:shadow-elevated transition-all duration-300 animate-fade-in hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {pizza.isVegetarian && (
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
        >
          <Plus className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-200" />
          Adicionar ao Carrinho
        </Button>
      </CardContent>
    </Card>
  );
}
