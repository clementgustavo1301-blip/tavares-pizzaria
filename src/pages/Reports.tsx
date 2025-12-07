import { useEffect, useState } from "react";
import { FileDown, TrendingUp, Pizza, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/AdminLayout";
import { supabase, DbOrder, DbOrderItem } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface FlavorStat {
  name: string;
  quantity: number;
  revenue: number;
}

const statusLabels: Record<string, string> = {
  pending: "Aguardando",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
};

const Reports = () => {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, itemsRes] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("order_items").select("*"),
        ]);

        if (ordersRes.data) setOrders(ordersRes.data);
        if (itemsRes.data) setOrderItems(itemsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  
  const todayRevenue = orders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const monthRevenue = orders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Calculate top flavors
  const flavorStats: FlavorStat[] = orderItems.reduce((acc: FlavorStat[], item) => {
    const existing = acc.find((f) => f.name === item.pizza_name);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
    } else {
      acc.push({
        name: item.pizza_name,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
      });
    }
    return acc;
  }, []);

  const topFlavors = flavorStats.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(192, 64, 0); // Terra Cotta color
    doc.text("Tavares Pizzaria", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(62, 39, 35); // Coffee color
    doc.text("Relatório Gerencial", 105, 30, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 105, 38, { align: "center" });

    // Revenue Summary
    doc.setFontSize(12);
    doc.setTextColor(62, 39, 35);
    doc.text("Resumo Financeiro", 14, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [["Período", "Valor"]],
      body: [
        ["Hoje", `R$ ${todayRevenue.toFixed(2).replace(".", ",")}`],
        ["Este Mês", `R$ ${monthRevenue.toFixed(2).replace(".", ",")}`],
        ["Total Geral", `R$ ${totalRevenue.toFixed(2).replace(".", ",")}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [192, 64, 0] },
    });

    // Top Flavors
    const finalY1 = (doc as any).lastAutoTable?.finalY || 100;
    doc.text("Vendas por Sabor", 14, finalY1 + 15);

    autoTable(doc, {
      startY: finalY1 + 20,
      head: [["Sabor", "Quantidade", "Receita"]],
      body: topFlavors.map((f) => [
        f.name,
        f.quantity.toString(),
        `R$ ${f.revenue.toFixed(2).replace(".", ",")}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [192, 64, 0] },
    });

    // Order History
    const finalY2 = (doc as any).lastAutoTable?.finalY || 150;
    doc.text("Histórico de Pedidos (Últimos 20)", 14, finalY2 + 15);

    autoTable(doc, {
      startY: finalY2 + 20,
      head: [["Data", "Cliente", "Status", "Valor"]],
      body: orders.slice(0, 20).map((order) => [
        new Date(order.created_at).toLocaleDateString("pt-BR"),
        order.customer_name,
        statusLabels[order.status] || order.status,
        `R$ ${(order.total_amount || 0).toFixed(2).replace(".", ",")}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [192, 64, 0] },
    });

    // Save
    doc.save("relatorio-tavares-pizzaria.pdf");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análise de vendas e desempenho</p>
          </div>
          <Button onClick={generatePDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Baixar Relatório PDF
          </Button>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {todayRevenue.toFixed(2).replace(".", ",")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas do Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {monthRevenue.toFixed(2).replace(".", ",")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalRevenue.toFixed(2).replace(".", ",")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Flavors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Pizza className="h-5 w-5 text-primary" />
              Vendas por Sabor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topFlavors.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {topFlavors.map((flavor, index) => (
                  <div
                    key={flavor.name}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{flavor.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {flavor.quantity} vendidas
                      </span>
                      <span className="font-bold text-primary">
                        R$ {flavor.revenue.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Histórico de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum pedido registrado ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 20).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer_name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.payment_method}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "secondary"
                              : order.status === "pending"
                              ? "outline"
                              : "default"
                          }
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        R$ {(order.total_amount || 0).toFixed(2).replace(".", ",")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Reports;
