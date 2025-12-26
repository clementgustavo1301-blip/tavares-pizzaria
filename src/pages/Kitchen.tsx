import { useState, useEffect } from "react";
import { Clock, ChefHat, Truck, CheckCircle, ArrowRight, RefreshCw, Users, Bike, XCircle, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrder, Order, OrderStatus } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderPrinter } from "@/components/OrderPrinter";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; bgColor: string; textColor: string }> = {
  aguardando: { label: "Novos Pedidos", icon: Clock, bgColor: "bg-accent", textColor: "text-accent-foreground" },
  preparando: { label: "No Forno", icon: ChefHat, bgColor: "bg-primary", textColor: "text-primary-foreground" },
  saiu: { label: "Pronto / Saiu", icon: Truck, bgColor: "bg-secondary", textColor: "text-secondary-foreground" },
  entregue: { label: "Concluído", icon: CheckCircle, bgColor: "bg-muted", textColor: "text-muted-foreground" },
  recusado: { label: "Recusado", icon: XCircle, bgColor: "bg-destructive/10", textColor: "text-destructive" },
};

const columns: OrderStatus[] = ["aguardando", "preparando", "saiu", "entregue"];

const OrderCard = ({
  order,
  onAdvance,
  onReject,
  onPrint,
  showAdvance,
  showReject
}: {
  order: Order;
  onAdvance: () => void;
  onReject?: () => void;
  onPrint: () => void;
  showAdvance: boolean;
  showReject?: boolean;
}) => (
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t gap-3 sm:gap-0">
        <span className="font-bold text-lg text-primary">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          {showReject && onReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              className="px-2"
              title="Recusar Pedido"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onPrint}
            className="px-2 border border-input hover:bg-accent hover:text-accent-foreground"
            title="Imprimir Cupom"
          >
            <Printer className="h-4 w-4" />
          </Button>

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
            <Bike className="h-4 w-4" />
          </Button>

          {showAdvance && (
            <Button size="sm" onClick={onAdvance} className="gap-1 flex-1 sm:flex-none">
              {order.status === 'aguardando' ? "Aceitar" : "Avançar"}
              {order.status === 'aguardando' ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const Kitchen = () => {
  const { orders, updateOrderStatus, refreshOrders, isLoading: isOrderLoading, getOrderById } = useOrder();
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Effect to handle actual printing when `printingOrder` is set
  useEffect(() => {
    if (printingOrder) {
      console.log("Printing order:", printingOrder.id);

      const timer = setTimeout(() => {
        window.print();
        setPrintingOrder(null); // Clear state to avoid loop
      }, 500); // 500ms delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [printingOrder]);

  // Realtime subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel("kitchen-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          console.log("New order detected:", payload);
          if (payload.new.status === 'pending' || payload.new.status === 'aguardando') {
            toast.info("Novo pedido recebido! Imprimindo...", { duration: 3000 });

            // Fetch full data manually
            const { data: orderData, error } = await supabase
              .from('orders')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            const { data: itemsData } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', payload.new.id);

            if (orderData && itemsData) {
              const newOrder: Order = {
                id: orderData.id,
                displayId: orderData.display_id,
                customerName: orderData.customer_name,
                customerAddress: orderData.address || "",
                total: orderData.total_amount,
                status: 'aguardando',
                paymentMethod: orderData.payment_method,
                createdAt: new Date(orderData.created_at),
                items: itemsData.map((item: any) => ({
                  pizza: { id: item.id, name: item.pizza_name, price: item.price, description: "", ingredients: [], image: "" },
                  quantity: item.quantity,
                  observation: item.observations
                }))
              };

              // Trigger print
              setPrintingOrder(newOrder);

              // Refresh list
              refreshOrders();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshOrders]);

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ["aguardando", "preparando", "saiu", "entregue"];
    const currentIndex = flow.indexOf(current);

    // Se for o último do fluxo normal, não tem próximo
    if (currentIndex === -1 || currentIndex >= flow.length - 1) return null;

    return flow[currentIndex + 1];
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

  const handleRejectClick = (order: Order) => {
    setRejectingOrder(order);
    setRejectionReason("");
  };

  const confirmRejection = async () => {
    if (!rejectingOrder) return;
    if (!rejectionReason.trim()) {
      toast.error("A justificativa é obrigatória para recusar o pedido.");
      return;
    }

    try {
      await updateOrderStatus(rejectingOrder.id, "recusado", rejectionReason);
      toast.success("Pedido recusado com sucesso.");
      setRejectingOrder(null);
    } catch (error) {
      toast.error("Erro ao recusar pedido.");
    }
  };

  const activeOrders = orders.filter((o) => {
    // Hide rejected orders
    if (o.status === "recusado") return false;

    // For completed orders, only show those from today
    if (o.status === "entregue") {
      const orderDate = new Date(o.deliveredAt || o.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Midnight today

      // If the order is older than midnight today, hide it
      if (orderDate < today) return false;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-foreground">
        {/* Helper Component for Printing */}
        <OrderPrinter order={printingOrder} />

        {/* Header */}
        <header className="bg-card border-b-2 border-primary/20 sticky top-0 z-10 shadow-md">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg md:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Cozinha
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Sistema de Pedidos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-foreground gap-2 py-1 px-2 md:px-3 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="font-bold">{activeOrders.length}</span>
                <span className="hidden sm:inline">ativos</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshOrders}
                disabled={isOrderLoading}
                className="hover:border-primary px-2"
              >
                <RefreshCw className={cn("h-4 w-4", isOrderLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </header>

        {/* Kanban Board */}
        <main className="p-2 md:p-6">
          {isOrderLoading ? (
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
                    const columnOrders = activeOrders.filter((o) => o.status === status);

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
                            onReject={() => handleRejectClick(order)}
                            onPrint={() => handlePrint(order)}
                            showAdvance={!!getNextStatus(order.status)}
                            showReject={order.status === 'aguardando'}
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
                  const columnOrders = activeOrders.filter((o) => o.status === status);

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
                            onReject={() => handleRejectClick(order)}
                            onPrint={() => handlePrint(order)}
                            showAdvance={!!getNextStatus(order.status)}
                            showReject={order.status === 'aguardando'}
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
      </div>

      <Dialog open={!!rejectingOrder} onOpenChange={(open) => !open && setRejectingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Pedido</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo do cancelamento para o cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Estamos sem massa no momento..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            {rejectionReason.trim() === "" && (
              <p className="text-xs text-destructive mt-2">* A justificativa é obrigatória.</p>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingOrder(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejection}
              disabled={!rejectionReason.trim()}
            >
              Confirmar Recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Kitchen;
