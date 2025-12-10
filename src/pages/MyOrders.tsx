import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Package, Clock, ChefHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, cleanCPF } from "@/utils/formatters";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  pizza_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  display_id?: string;
  customer_name: string;
  total_amount: number;
  status: string;
  payment_method: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Aguardando", icon: <Clock className="h-4 w-4" />, color: "bg-amber-500" },
  preparing: { label: "Preparando", icon: <ChefHat className="h-4 w-4" />, color: "bg-blue-500" },
  ready: { label: "Saiu para Entrega", icon: <Truck className="h-4 w-4" />, color: "bg-purple-500" },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSearch = async () => {
    const cleanedCPF = cleanCPF(cpf);

    if (cleanedCPF.length !== 11) {
      toast.error("Por favor, insira um CPF válido.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Fetch orders by CPF, excluding delivered orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("cpf", cleanedCPF)
        .neq("status", "delivered")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        toast.error("Erro ao buscar pedidos.");
        setOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch order items for all orders
      const orderIds = ordersData.map((order) => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      }

      // Map orders with their items
      const ordersWithItems: Order[] = ordersData.map((order) => ({
        ...order,
        items: (itemsData || []).filter((item) => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error in handleSearch:", error);
      toast.error("Erro ao buscar pedidos.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Cardápio
        </Button>

        <div className="text-center mb-8">
          <img src={logo} alt="Tavares Pizzaria" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Meus Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Digite seu CPF para ver seus pedidos em andamento
          </p>
        </div>

        {/* CPF Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="cpf" className="sr-only">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCPFChange}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {hasSearched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h2>
                  <p className="text-muted-foreground">
                    Não encontramos pedidos em andamento para este CPF.
                  </p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;

                return (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/pedido/${order.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">
                          {order.display_id || `Pedido #${order.id.slice(0, 8)}`}
                        </CardTitle>
                        <Badge className={`${status.color} text-white flex items-center gap-1`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.pizza_name}
                            </span>
                            <span className="text-muted-foreground">
                              R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-primary">
                            R$ {order.total_amount.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
