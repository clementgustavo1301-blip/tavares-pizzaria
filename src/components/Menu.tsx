import { useState } from "react";
import { PizzaCard } from "./PizzaCard";
import { HalfHalfModal } from "./HalfHalfModal";
import { useMenuItems, Pizza } from "@/hooks/useMenuItems";
import { useOrder } from "@/context/OrderContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slice } from "lucide-react";
import { toast } from "sonner";
export function Menu() {
  const {
    pizzas,
    loading,
    error
  } = useMenuItems();
  const {
    addToCart
  } = useOrder();
  const [halfHalfOpen, setHalfHalfOpen] = useState(false);

  // Group pizzas by category
  const groupedPizzas = pizzas.reduce((acc, pizza) => {
    const category = pizza.category || "Tradicionais";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(pizza);
    return acc;
  }, {} as Record<string, typeof pizzas>);
  const categoryOrder = ["Tradicionais", "Doces"];
  const sortedCategories = Object.keys(groupedPizzas).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  const handleAddHalfHalf = (pizza: Pizza, observation?: string) => {
    addToCart(pizza, observation);
    toast.success("Pizza Meio a Meio adicionada!", {
      description: `${pizza.name} - R$ ${pizza.price.toFixed(2).replace(".", ",")}`,
      duration: 2000
    });
  };
  return <section id="cardapio" className="py-16 md:py-20 gradient-paper bg-paper-texture">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-widest mb-3">
            Feito com amor
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Pizzas artesanais preparadas com ingredientes frescos e massa feita diariamente.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
            <div className="w-24 h-1 bg-primary rounded-full" />
            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
          </div>
        </div>

        {/* Half & Half Card */}
        {!loading && !error && pizzas.length > 0 && <div className="mb-12">
            <Card className="max-w-lg mx-auto overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Slice className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Pizza Meio a Meio
                </h3>
                <p className="text-muted-foreground mb-4">Monte sua pizza com dois sabores diferentes! O valor será a metade de cada pizza.</p>
                <Button onClick={() => setHalfHalfOpen(true)} variant="hero" size="lg" className="gap-2">
                  <Slice className="h-5 w-5" />
                  Montar Meio a Meio
                </Button>
              </CardContent>
            </Card>
          </div>}

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => <div key={i} className="space-y-4">
                <Skeleton className="h-52 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>)}
          </div>}

        {error && <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>}

        {!loading && !error && sortedCategories.map(category => <div key={category} className="mb-12 last:mb-0">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 text-center">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {groupedPizzas[category].map((pizza, index) => <div key={pizza.id} className="animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                  <PizzaCard pizza={pizza} />
                </div>)}
            </div>
          </div>)}

        {!loading && !error && pizzas.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum item no cardápio ainda.</p>
          </div>}
      </div>

      {/* Half & Half Modal */}
      <HalfHalfModal open={halfHalfOpen} onOpenChange={setHalfHalfOpen} pizzas={pizzas} onAddToCart={handleAddHalfHalf} />
    </section>;
}