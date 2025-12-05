import { useState } from "react";
import { Clock, ChefHat, Truck, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrder, Order, OrderStatus } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  aguardando: { label: "Novos Pedidos", icon: Clock, color: "bg-accent text-accent-foreground" },
  preparando: { label: "No Forno", icon: ChefHat, color: "bg-primary text-primary-foreground" },
  saiu: { label: "Pronto/Saiu", icon: Truck, color: "bg-secondary text-secondary-foreground" },
  entregue: { label: "Entregue", icon: CheckCircle, color: "bg-muted text-muted-foreground" },
};

const columns: OrderStatus[] = ["aguardando", "preparando", "saiu"];

const Kitchen = () => {
  const { orders, updateOrderStatus } = useOrder();
  const [refreshKey, setRefreshKey] = useState(0);

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ["aguardando", "preparando", "saiu", "entregue"];
    const currentIndex = flow.indexOf(current);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  const handleAdvanceStatus = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
      toast.success(`Pedido ${order.id} atualizado!`, {
        description: `Status: ${statusConfig[nextStatus].label}`,
      });
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "entregue");

  return (
    <div className="min-h-screen bg-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Tavares Pizzaria" className="h-12" />
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                Cozinha
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Pedidos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-foreground">
              {activeOrders.length} pedidos ativos
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="container mx-auto px-4 py-6" key={refreshKey}>
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Clock className="h-16 w-16 text-primary-foreground/30 mb-4" />
            <h2 className="text-xl font-serif text-primary-foreground mb-2">
              Nenhum pedido no momento
            </h2>
            <p className="text-primary-foreground/60">
              Os pedidos aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const columnOrders = orders.filter((o) => o.status === status);

              return (
                <div key={status} className="space-y-4">
                  {/* Column Header */}
                  <div className={cn("p-4 rounded-lg", config.color)}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h2 className="font-semibold">{config.label}</h2>
                      <Badge variant="secondary" className="ml-auto">
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Cards */}
                  <div className="space-y-3 min-h-[200px]">
                    {columnOrders.map((order) => (
                      <Card
                        key={order.id}
                        className="animate-fade-in hover:shadow-elevated transition-shadow"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-mono">
                              {order.id}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm">
                            <p className="font-medium text-foreground">
                              {order.customerName}
                            </p>
                            <p className="text-muted-foreground text-xs truncate">
                              {order.customerAddress}
                            </p>
                          </div>

                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div
                                key={item.pizza.id}
                                className="flex justify-between text-sm"
                              >
                                <span className="font-medium">
                                  {item.quantity}x {item.pizza.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-bold text-primary">
                              R$ {order.total.toFixed(2).replace(".", ",")}
                            </span>
                            {getNextStatus(order.status) && (
                              <Button
                                size="sm"
                                onClick={() => handleAdvanceStatus(order)}
                              >
                                Avançar
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Kitchen;
