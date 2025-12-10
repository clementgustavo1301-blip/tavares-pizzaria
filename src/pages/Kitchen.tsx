import { Clock, ChefHat, Truck, CheckCircle, ArrowRight, RefreshCw, Users, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrder, Order, OrderStatus } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; bgColor: string; textColor: string }> = {
  aguardando: { label: "Novos Pedidos", icon: Clock, bgColor: "bg-accent", textColor: "text-accent-foreground" },
  preparando: { label: "No Forno", icon: ChefHat, bgColor: "bg-primary", textColor: "text-primary-foreground" },
  saiu: { label: "Pronto / Saiu", icon: Truck, bgColor: "bg-secondary", textColor: "text-secondary-foreground" },
  entregue: { label: "Concluído", icon: CheckCircle, bgColor: "bg-muted", textColor: "text-muted-foreground" },
};

const columns: OrderStatus[] = ["aguardando", "preparando", "saiu", "entregue"];

const OrderCard = ({ order, onAdvance, showAdvance }: { order: Order; onAdvance: () => void; showAdvance: boolean }) => (
  <Card className="animate-fade-in card-rustic hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base font-mono font-bold text-primary">
          {order.displayId || `#${order.id.slice(0, 8)}`}
        </CardTitle>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="text-sm border-b pb-3">
        <p className="font-semibold text-foreground">{order.customerName}</p>
        <p className="text-muted-foreground text-xs truncate mt-0.5">
          📍 {order.customerAddress}
        </p>
      </div>

      <div className="space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-primary/10 text-primary font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
              <span className="font-medium">{item.pizza.name}</span>
            </div>
            {item.observation && (
              <p className="ml-8 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">
                ⚠️ {item.observation}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <span className="font-bold text-lg text-primary">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const gpsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                order.customerAddress + " Mossoro RN"
              )}`;
              const message = `🍕 *Nova Entrega - Pedido #${order.id.slice(0, 8)}*\n👤 *Cliente:* ${order.customerName
                }\n📍 *Endereço:* ${order.customerAddress}\n\n🗺️ *Abrir no GPS:* ${gpsLink}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
            }}
            className="gap-1 border-primary/20 hover:bg-primary/5"
            title="Enviar para Entregador"
          >
            <Bike className="h-3 w-3" />
          </Button>
          {showAdvance && (
            <Button size="sm" onClick={onAdvance} className="gap-1">
              Avançar
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const Kitchen = () => {
  const { orders, updateOrderStatus, refreshOrders, isLoading } = useOrder();

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ["aguardando", "preparando", "saiu", "entregue"];
    const currentIndex = flow.indexOf(current);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      try {
        await updateOrderStatus(order.id, nextStatus);
        toast.success(`Pedido ${order.displayId || order.id.slice(0, 8)} atualizado!`, {
          description: `Novo status: ${statusConfig[nextStatus].label}`,
        });
      } catch (error) {
        toast.error("Erro ao atualizar pedido");
      }
    }
  };

  const activeOrders = orders.filter((o) => {
    if (o.status !== "entregue") return true;

    // For completed orders, only show today's orders
    const today = new Date().toDateString();
    const orderDate = new Date(o.createdAt).toDateString();
    return orderDate === today;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-foreground">
        {/* Header */}
        <header className="bg-card border-b-2 border-primary/20 sticky top-0 z-10 shadow-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg md:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Cozinha
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Sistema de Pedidos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-foreground gap-2 py-1.5 px-3">
                <Users className="h-3.5 w-3.5" />
                <span className="font-bold">{activeOrders.length}</span>
                <span className="hidden sm:inline">pedidos ativos</span>
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshOrders}
                disabled={isLoading}
                className="hover:border-primary"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </header>

        {/* Kanban Board */}
        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-primary-foreground/60">Carregando pedidos...</div>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-8 rounded-full bg-primary-foreground/10 mb-6">
                <Clock className="h-16 w-16 text-primary-foreground/40" />
              </div>
              <h2 className="text-xl font-serif text-primary-foreground mb-2">
                Nenhum pedido no momento
              </h2>
              <p className="text-primary-foreground/60 text-center max-w-sm">
                Os pedidos aparecerão aqui automaticamente quando forem realizados.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View - Tabs */}
              <div className="md:hidden">
                <Tabs defaultValue="aguardando" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-4">
                    {columns.map((status) => {
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      return (
                        <TabsTrigger key={status} value={status} className="flex flex-col items-center gap-1 py-2 h-auto text-xs">
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{config.label.split(" ")[0]}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {columns.map((status) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    const columnOrders = orders.filter((o) => o.status === status);

                    return (
                      <TabsContent key={status} value={status} className="space-y-4">
                        <div className={cn("p-4 rounded-xl flex items-center gap-3 mb-4", config.bgColor, config.textColor)}>
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h2 className="font-bold text-lg">{config.label}</h2>
                          <Badge className="ml-auto bg-white/20 text-inherit hover:bg-white/30">
                            {columnOrders.length}
                          </Badge>
                        </div>

                        {columnOrders.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                            Sem pedidos nesta etapa
                          </div>
                        )}

                        {columnOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onAdvance={() => handleAdvanceStatus(order)}
                            showAdvance={!!getNextStatus(order.status)}
                          />
                        ))}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>

              {/* Desktop View - Grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {columns.map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const columnOrders = orders.filter((o) => o.status === status);

                  return (
                    <div key={status} className="space-y-4">
                      {/* Column Header */}
                      <div className={cn("p-4 rounded-xl flex items-center gap-3", config.bgColor, config.textColor)}>
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-lg">{config.label}</h2>
                        <Badge className="ml-auto bg-white/20 text-inherit hover:bg-white/30">
                          {columnOrders.length}
                        </Badge>
                      </div>

                      {/* Order Cards */}
                      <div className="space-y-3 min-h-[200px]">
                        {columnOrders.length === 0 && (
                          <div className="text-center py-8 text-primary-foreground/40 text-sm">
                            Sem pedidos
                          </div>
                        )}
                        {columnOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onAdvance={() => handleAdvanceStatus(order)}
                            showAdvance={!!getNextStatus(order.status)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div >
    </AdminLayout >
  );
};

export default Kitchen;
