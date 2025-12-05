import { Plus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza } from "@/data/pizzas";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const { addToCart } = useOrder();

  const handleAddToCart = () => {
    addToCart(pizza);
    toast.success(`${pizza.name} adicionada ao carrinho!`, {
      description: `R$ ${pizza.price.toFixed(2).replace(".", ",")}`,
    });
  };

  return (
    <Card className="group overflow-hidden bg-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
      <div className="relative overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {pizza.isVegetarian && (
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground gap-1">
            <Leaf className="h-3 w-3" />
            Vegetariana
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-foreground">
            {pizza.name}
          </h3>
          <span className="text-lg font-bold text-primary">
            R$ {pizza.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3">
          {pizza.description}
        </p>
        
        <p className="text-xs text-muted-foreground mb-4">
          <span className="font-medium">Ingredientes:</span>{" "}
          {pizza.ingredients.join(", ")}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full"
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </CardContent>
    </Card>
  );
}
