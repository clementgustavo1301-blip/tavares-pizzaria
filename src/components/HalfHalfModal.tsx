import { useState, useMemo } from "react";
import { Pizza } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, X } from "lucide-react";

interface HalfHalfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pizzas: Pizza[];
  onAddToCart: (pizza: Pizza, observation?: string) => void;
}

export function HalfHalfModal({ open, onOpenChange, pizzas, onAddToCart }: HalfHalfModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstFlavor, setFirstFlavor] = useState<Pizza | null>(null);
  const [secondFlavor, setSecondFlavor] = useState<Pizza | null>(null);
  const [observation, setObservation] = useState("");

  // Filter only "Tradicionais" pizzas for half & half
  const traditionalPizzas = useMemo(
    () => pizzas.filter((p) => p.category === "Tradicionais" || !p.category),
    [pizzas]
  );

  const handleSelectFlavor = (pizza: Pizza) => {
    if (step === 1) {
      setFirstFlavor(pizza);
      setStep(2);
    } else {
      setSecondFlavor(pizza);
    }
  };

  const handleConfirm = () => {
    if (firstFlavor && secondFlavor) {
      // Calculate price: average of the two
      const finalPrice = (firstFlavor.price + secondFlavor.price) / 2;
      
      // Create composite pizza object
      const halfHalfPizza: Pizza = {
        id: `half-${firstFlavor.id}-${secondFlavor.id}-${Date.now()}`,
        name: `Meia ${firstFlavor.name} / Meia ${secondFlavor.name}`,
        description: `Metade ${firstFlavor.name} e metade ${secondFlavor.name}`,
        ingredients: [
          ...firstFlavor.ingredients.slice(0, 3),
          ...secondFlavor.ingredients.slice(0, 3),
        ],
        price: finalPrice,
        image: firstFlavor.image,
        isVegetarian: firstFlavor.isVegetarian && secondFlavor.isVegetarian,
        category: "Meio a Meio",
      };

      onAddToCart(halfHalfPizza, observation.trim() || undefined);
      handleReset();
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFirstFlavor(null);
    setSecondFlavor(null);
    setObservation("");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSecondFlavor(null);
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const calculatedPrice = useMemo(() => {
    if (firstFlavor && secondFlavor) {
      return (firstFlavor.price + secondFlavor.price) / 2;
    }
    return null;
  }, [firstFlavor, secondFlavor]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-serif">
            Montar Pizza Meio a Meio
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecione dois sabores para criar sua pizza meio a meio
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={step === 1 ? "default" : "secondary"} className="gap-1">
              {firstFlavor ? <Check className="h-3 w-3" /> : "1"}
              {firstFlavor ? firstFlavor.name : "Primeiro Sabor"}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={step === 2 ? "default" : "outline"} className="gap-1">
              {secondFlavor ? <Check className="h-3 w-3" /> : "2"}
              {secondFlavor ? secondFlavor.name : "Segundo Sabor"}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh] px-6">
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              {step === 1
                ? "Escolha o primeiro sabor:"
                : "Agora escolha o segundo sabor:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {traditionalPizzas.map((pizza) => {
                const isSelected =
                  (step === 1 && firstFlavor?.id === pizza.id) ||
                  (step === 2 && secondFlavor?.id === pizza.id);
                const isFirstSelected = step === 2 && firstFlavor?.id === pizza.id;

                return (
                  <button
                    key={pizza.id}
                    onClick={() => !isFirstSelected && handleSelectFlavor(pizza)}
                    disabled={isFirstSelected}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : isFirstSelected
                        ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {pizza.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {pizza.ingredients.slice(0, 3).join(", ")}...
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        R$ {pizza.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                    {isFirstSelected && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        1º Sabor
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t bg-muted/30">
          {/* Observations and Price Preview */}
          {firstFlavor && secondFlavor && (
            <div className="space-y-3 mb-4">
              <Textarea
                placeholder="Observações: Ex: Tirar cebola, pouco orégano..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="text-sm min-h-[60px] resize-none"
              />
              <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Preço final (média):</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {calculatedPrice?.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            <Button variant="ghost" onClick={handleClose} className={step === 1 ? "flex-1" : ""}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            {firstFlavor && secondFlavor && (
              <Button onClick={handleConfirm} variant="hero" className="flex-1">
                Adicionar ao Carrinho
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}