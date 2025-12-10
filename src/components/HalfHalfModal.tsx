import { useState, useMemo, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Slice } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HalfHalfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pizzas: Pizza[];
}

interface CrustOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

export function HalfHalfModal({ open, onOpenChange, pizzas }: HalfHalfModalProps) {
  const { addToCart } = useOrder();
  const [flavor1Id, setFlavor1Id] = useState<string>("");
  const [flavor2Id, setFlavor2Id] = useState<string>("");
  const [selectedBorda, setSelectedBorda] = useState<string>("");
  const [observation, setObservation] = useState("");
  const [crustOptions, setCrustOptions] = useState<CrustOption[]>([]);
  const [loadingCrusts, setLoadingCrusts] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCrustOptions();
    }
  }, [open]);

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

  const availablePizzas = useMemo(() => {
    return pizzas
      .filter((p) => {
        const cat = (p.category || "").toLowerCase();
        return (
          cat.includes("pizza") ||
          cat.includes("tradicionais") ||
          cat.includes("especiais") ||
          cat.includes("doces")
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [pizzas]);

  const flavor1 = useMemo(() => availablePizzas.find((p) => p.id === flavor1Id), [availablePizzas, flavor1Id]);
  const flavor2 = useMemo(() => availablePizzas.find((p) => p.id === flavor2Id), [availablePizzas, flavor2Id]);

  const calculatePrice = () => {
    let basePrice = 0;

    if (flavor1 && flavor2) {
      basePrice = (flavor1.price + flavor2.price) / 2;
    } else if (flavor1) {
      basePrice = flavor1.price;
    } else if (flavor2) {
      basePrice = flavor2.price;
    }

    const crustOption = crustOptions.find(c => c.name === selectedBorda);
    const crustPrice = crustOption ? crustOption.price : 0;

    return basePrice + crustPrice;
  };

  const finalPrice = calculatePrice();

  const handleConfirm = () => {
    if (!flavor1 || !flavor2 || !selectedBorda) {
      toast.error("Complete seu pedido", {
        description: "Selecione dois sabores e uma borda.",
      });
      return;
    }

    const halfHalfPizza: Pizza = {
      id: `half-${flavor1.id}-${flavor2.id}-${Date.now()}`,
      name: `Meio ${flavor1.name} / Meio ${flavor2.name}`,
      description: `Metade ${flavor1.name}, Metade ${flavor2.name}`,
      ingredients: [
        ...flavor1.ingredients.slice(0, 3),
        ...flavor2.ingredients.slice(0, 3),
      ],
      price: finalPrice,
      image: flavor1.image,
      isVegetarian: flavor1.isVegetarian && flavor2.isVegetarian,
      category: "Meio a Meio",
    };

    addToCart(halfHalfPizza, observation.trim() || undefined, selectedBorda);

    toast.success("Adicionado ao carrinho!", {
      description: `Meio a Meio - R$ ${finalPrice.toFixed(2).replace(".", ",")}`,
    });

    handleClose();
  };

  const handleClose = () => {
    setFlavor1Id("");
    setFlavor2Id("");
    setSelectedBorda("");
    setObservation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Slice className="h-6 w-6 text-primary" />
            Montar Pizza Meio a Meio
          </DialogTitle>
          <DialogDescription>
            Escolha dois sabores. O preço será a média aritmética dos dois sabores + borda.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flavor 1 */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full">1</Badge>
                Primeiro Sabor
              </label>
              <Select value={flavor1Id} onValueChange={setFlavor1Id}>
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Selecione o 1º sabor" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availablePizzas.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={!p.available || p.id === flavor2Id} className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">R$ {p.price.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flavor 2 */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full">2</Badge>
                Segundo Sabor
              </label>
              <Select value={flavor2Id} onValueChange={setFlavor2Id}>
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Selecione o 2º sabor" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availablePizzas.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={!p.available || p.id === flavor1Id} className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">R$ {p.price.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Crust Selection */}
          <div className="space-y-3 pt-2 border-t">
            <label className="text-sm font-medium flex items-center gap-2">
              Borda (Obrigatório)
            </label>
            <Select value={selectedBorda} onValueChange={setSelectedBorda}>
              <SelectTrigger>
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

          {/* Observation */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              placeholder="Ex: Tirar cebola de um lado, caprichar no orégano..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Price & Action */}
          <div className="bg-muted/30 p-4 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">Preço Final</p>
              <p className="text-2xl font-bold text-primary">
                R$ {finalPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="ghost" onClick={handleClose} className="flex-1 md:flex-none">
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!flavor1 || !flavor2 || !selectedBorda}
                className="flex-1 md:flex-none min-w-[200px]"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}