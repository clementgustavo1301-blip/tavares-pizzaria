import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useOrder();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-3 font-serif text-xl">
            <div className="p-2 rounded-full bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            Seu Carrinho
            {cart.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="p-6 rounded-full bg-muted mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Carrinho vazio</p>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Adicione pizzas deliciosas do nosso cardápio!
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => onOpenChange(false)}
            >
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 -mx-2 px-2">
              {cart.map((item) => (
                <div
                  key={item.pizza.id}
                  className="flex gap-4 p-3 bg-muted/50 rounded-xl animate-fade-in border border-border/50"
                >
                  <img
                    src={item.pizza.image}
                    alt={item.pizza.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {item.pizza.name}
                    </h4>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      R$ {(item.pizza.price * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateQuantity(item.pizza.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateQuantity(item.pizza.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto rounded-full"
                        onClick={() => removeFromCart(item.pizza.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3 bg-background">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  R$ {cartTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span className="text-secondary font-semibold">Grátis</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {cartTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <Button
                variant="hero"
                className="w-full mt-2"
                onClick={handleCheckout}
              >
                Finalizar Pedido
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
