import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChefHat, Truck, CheckCircle, Home, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrder, OrderStatus } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType; description: string }[] = [
  { status: "aguardando", label: "Aguardando", icon: Clock, description: "Pedido recebido" },
  { status: "preparando", label: "Preparando", icon: ChefHat, description: "No forno a lenha" },
  { status: "saiu", label: "A Caminho", icon: Truck, description: "Saiu para entrega" },
  { status: "entregue", label: "Entregue", icon: CheckCircle, description: "Bom apetite!" },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, currentOrder } = useOrder();
  const [animateStatus, setAnimateStatus] = useState(false);

  const order = orders.find((o) => o.id === orderId) || currentOrder;
  const currentStepIndex = order ? statusSteps.findIndex((s) => s.status === order.status) : -1;

  // Trigger animation when status changes
  useEffect(() => {
    if (order) {
      setAnimateStatus(true);
      const timer = setTimeout(() => setAnimateStatus(false), 600);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center card-rustic">
          <CardContent className="pt-8 pb-8">
            <img src={logo} alt="Tavares Pizzaria" className="h-20 mx-auto mb-6" />
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-serif font-bold mb-2">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Verifique o código do pedido ou faça um novo pedido.
            </p>
            <Button onClick={() => navigate("/")} variant="default">
              Ver Cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-paper bg-paper-texture py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <img src={logo} alt="Tavares Pizzaria" className="h-20 md:h-24 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Acompanhe seu Pedido
          </h1>
          <p className="text-muted-foreground mt-2">
            Pedido: <span className="font-mono font-bold text-primary text-lg">{order.id}</span>
          </p>
        </div>

        {/* Status Steps */}
        <Card className="mb-8 card-rustic overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Current Status Banner */}
            <div className={cn(
              "mb-8 p-4 rounded-xl text-center transition-all duration-300",
              order.status === "entregue" ? "bg-secondary/20" : "bg-primary/10"
            )}>
              <p className="text-sm text-muted-foreground mb-1">Status Atual</p>
              <p className={cn(
                "text-xl font-serif font-bold transition-all duration-300",
                order.status === "entregue" ? "text-secondary" : "text-primary",
                animateStatus && "scale-110"
              )}>
                {statusSteps[currentStepIndex]?.label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusSteps[currentStepIndex]?.description}
              </p>
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-md",
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border-2 border-muted text-muted-foreground",
                          isCurrent && "ring-4 ring-primary/30 scale-110"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", isCurrent && "animate-pulse")} />
                      </div>
                      <span
                        className={cn(
                          "mt-3 text-xs md:text-sm font-medium text-center max-w-[60px] md:max-w-none",
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="card-rustic">
          <CardHeader className="border-b">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">Cliente</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">Pagamento</p>
                <p className="font-semibold capitalize">
                  {order.paymentMethod === "pix" ? "PIX" : 
                   order.paymentMethod === "credit" ? "Cartão" : "Dinheiro"}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs mb-1">Endereço de Entrega</p>
              <p className="font-semibold">{order.customerAddress}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-xs mb-3 uppercase tracking-wide font-medium">Itens do Pedido</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.pizza.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center">
                        {item.quantity}x
                      </span>
                      <span className="font-medium">{item.pizza.name}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      R$ {(item.pizza.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-xl text-primary">
                  R$ {order.total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
