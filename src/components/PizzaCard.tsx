import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Info, Loader2, Leaf, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrder } from "@/context/OrderContext";
import { Pizza } from "@/hooks/useMenuItems";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PizzaCardProps {
  pizza: Pizza;
}

interface CrustOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const { addToCart } = useOrder();
  const [selectedBorda, setSelectedBorda] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [crustOptions, setCrustOptions] = useState<CrustOption[]>([]);
  const [loadingCrusts, setLoadingCrusts] = useState(false);

  // Check if the item is a pizza based on category
  const isPizza = (pizza.category || "").toLowerCase().includes("pizza") ||
    (pizza.category || "").toLowerCase().includes("tradicionais") ||
    (pizza.category || "").toLowerCase().includes("especiais") ||
    (pizza.category || "").toLowerCase().includes("doces");

  useEffect(() => {
    if (isPizza) {
      fetchCrustOptions();
    }
  }, [isPizza]);

  const fetchCrustOptions = async () => {
    setLoadingCrusts(true);
    try {
      const { data, error } = await supabase
        .from("crust_options")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setCrustOptions(data || []);
    } catch (error) {
      console.error("Error fetching crusts:", error);
    } finally {
      setLoadingCrusts(false);
    }
  };

  const selectedCrustPrice = crustOptions.find(c => c.name === selectedBorda)?.price || 0;
  const totalPrice = pizza.price + selectedCrustPrice;

  const handleAddToCart = () => {
    if (isPizza && !selectedBorda) {
      toast.error("Selecione uma borda", {
        description: "Por favor, escolha uma opção de borda para sua pizza.",
      });
      return;
    }

    addToCart(pizza, observation.trim() || undefined, selectedBorda);
    toast.success("Adicionado ao carrinho!", {
      description: `${pizza.name}${selectedBorda ? ` com borda ${selectedBorda}` : ""} - R$ ${totalPrice.toFixed(2).replace(".", ",")}`,
    });

    // Reset selection after adding
    setSelectedBorda("");
    setObservation("");
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/10 hover:shadow-elevated transition-all duration-300 group bg-card">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={handleAddToCart}
          >
            Adicionar Rápido
          </Button>
        </div>
        {!pizza.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl font-bold uppercase tracking-widest text-destructive rotate-[-15deg] border-4 border-destructive px-4 py-2 rounded-lg">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif font-bold text-xl leading-tight text-foreground line-clamp-2">
            {pizza.name}
          </h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
            R$ {pizza.price.toFixed(2).replace(".", ",")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {pizza.description}
        </p>

        {isPizza && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Borda
            </label>
            <Select value={selectedBorda} onValueChange={setSelectedBorda}>
              <SelectTrigger className="w-full text-sm h-9">
                <SelectValue placeholder={loadingCrusts ? "Carregando..." : "Selecione a borda"} />
              </SelectTrigger>
              <SelectContent>
                {crustOptions.map((crust) => (
                  <SelectItem key={crust.id} value={crust.name}>
                    <div className="flex justify-between w-full gap-2 items-center">
                      <span>{crust.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {crust.price === 0 ? "Grátis" : `+ R$ ${crust.price.toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Observações (Opcional)
          </label>
          <Textarea
            placeholder="Ex: Tirar cebola, sem orégano, caprichar no molho..."
            className="min-h-[60px] resize-none text-sm"
            rows={2}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full font-semibold shadow-sm hover:shadow-md transition-all h-10"
          onClick={handleAddToCart}
          disabled={!pizza.available}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isPizza ? (
            selectedBorda
              ? `Adicionar (R$ ${totalPrice.toFixed(2).replace(".", ",")})`
              : "Selecione uma borda"
          ) : (
            "Adicionar ao Carrinho"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
