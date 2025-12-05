import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChefHat, Truck, CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrder, OrderStatus } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "aguardando", label: "Aguardando", icon: Clock },
  { status: "preparando", label: "Preparando", icon: ChefHat },
  { status: "saiu", label: "Saiu para Entrega", icon: Truck },
  { status: "entregue", label: "Entregue", icon: CheckCircle },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, currentOrder } = useOrder();

  const order = orders.find((o) => o.id === orderId) || currentOrder;

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <img src={logo} alt="Tavares Pizzaria" className="h-20 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-bold mb-2">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Verifique o código do pedido ou faça um novo pedido.
            </p>
            <Button onClick={() => navigate("/")}>
              Ver Cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <img src={logo} alt="Tavares Pizzaria" className="h-24 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Status do Pedido
          </h1>
          <p className="text-muted-foreground mt-2">
            Pedido: <span className="font-mono font-semibold text-primary">{order.id}</span>
          </p>
        </div>

        {/* Status Steps */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
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
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                          isCurrent && "ring-4 ring-primary/30 animate-pulse"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "mt-3 text-sm font-medium text-center",
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
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pagamento</p>
                <p className="font-medium capitalize">
                  {order.paymentMethod === "pix" ? "PIX" : 
                   order.paymentMethod === "credit" ? "Cartão" : "Dinheiro"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm mb-2">Endereço de Entrega</p>
              <p className="font-medium">{order.customerAddress}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm mb-3">Itens</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.pizza.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.pizza.name}
                    </span>
                    <span className="font-medium">
                      R$ {(item.pizza.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">
                  R$ {order.total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
