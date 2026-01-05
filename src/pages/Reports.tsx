import { useEffect, useState } from "react";
import { FileDown, TrendingUp, Pizza, DollarSign, Calendar, Clock, Activity, AlertCircle, XCircle } from "lucide-react";
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
import { supabase, DbOrder, DbOrderItem } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInMinutes, parseISO, getDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatOrderNumber } from "@/lib/formatOrderNumber";

interface FlavorStat {
  name: string;
  quantity: number;
  revenue: number;
}

interface MenuItemCost {
  id: string;
  name: string;
  production_cost: number | null;
}

const statusLabels: Record<string, string> = {
  pending: "Aguardando",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  rejected: "Recusado",
  recusado: "Recusado",
};

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const Reports = () => {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, itemsRes, menuRes] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: true }),
          supabase.from("order_items").select("*"),
          supabase.from("menu_items").select("id, name, production_cost"),
        ]);

        if (ordersRes.data) {
          // Generate sequential IDs
          const dateCounters: Record<string, number> = {};
          const enrichedOrders = ordersRes.data.map(order => {
            const date = new Date(order.created_at);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const key = `${day}${month}`;

            if (!dateCounters[key]) dateCounters[key] = 0;
            dateCounters[key]++;

            return {
              ...order,
              display_id: `#${key}-${String(dateCounters[key]).padStart(3, '0')}`
            };
          });

          // Reverse to show newest first
          setOrders(enrichedOrders.reverse());
        }

        if (itemsRes.data) setOrderItems(itemsRes.data);
        if (menuRes.data) setMenuItems(menuRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Calculations (STRICTLY COMPLETED ORDERS) ---

  // Filter only 'delivered' orders for financial and intelligence calculations
  const completedOrders = orders.filter(order => order.status === 'delivered');
  const completedOrderIds = new Set(completedOrders.map(o => o.id));
  const completedOrderItems = orderItems.filter(item => completedOrderIds.has(item.order_id));

  // --- Calculations (REJECTED ORDERS / LOST REVENUE) ---
  const rejectedOrders = orders.filter(order => order.status === 'rejected' || (order.status as string) === 'recusado');
  const rejectedOrderIds = new Set(rejectedOrders.map(o => o.id));
  const rejectedOrderItems = orderItems.filter(item => rejectedOrderIds.has(item.order_id));

  const lostRevenue = rejectedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const rejectedCount = rejectedOrders.length;

  const rejectedFlavorStats: FlavorStat[] = rejectedOrderItems.reduce((acc: FlavorStat[], item) => {
    const existing = acc.find((f) => f.name === item.pizza_name);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity; // Potential revenue lost
    } else {
      acc.push({
        name: item.pizza_name,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
      });
    }
    return acc;
  }, []);

  const topRejectedFlavors = rejectedFlavorStats.sort((a, b) => b.quantity - a.quantity).slice(0, 5);


  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const todayRevenue = completedOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const monthRevenue = completedOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // --- Cost & Profit Calculations ---
  // Helper to get cost for a single item (approximated by current menu cost)
  const getItemCost = (itemName: string): number => {
    const menuItem = menuItems.find(m => m.name === itemName);
    return menuItem?.production_cost || 0;
  };

  const calculateOrderCost = (orderId: string) => {
    const items = orderItems.filter(i => i.order_id === orderId);
    return items.reduce((sum, item) => sum + (getItemCost(item.pizza_name) * item.quantity), 0);
  };

  const totalCost = completedOrders.reduce((sum, order) => sum + calculateOrderCost(order.id), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const todayCost = completedOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + calculateOrderCost(order.id), 0);
  const todayProfit = todayRevenue - todayCost;

  const monthCost = completedOrders
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, order) => sum + calculateOrderCost(order.id), 0);
  const monthProfit = monthRevenue - monthCost;

  // Stats for Intelligence (USING COMPLETED ORDERS ONLY)
  const getIntelligenceData = () => {
    try {
      const monthlyRevenue: Record<string, number> = {};
      const dayOfWeekCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      let totalOrderTime = 0;
      let countOrderTime = 0;

      completedOrders.forEach(order => {
        if (!order.created_at) return;

        const date = parseISO(order.created_at);
        const monthKey = format(date, "MMM/yyyy", { locale: ptBR });

        // Monthly Rev
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (order.total_amount || 0);

        // Day of Week
        const day = getDay(date);
        dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;

        // Avg Order Time (Delivered - Created)
        const endTime = order.delivered_at; // Only using delivered_at since we filtered for delivered
        if (endTime) {
          try {
            const diff = differenceInMinutes(parseISO(endTime), parseISO(order.created_at));
            if (diff >= 0 && diff < 1440) { // Filter outliers (> 24h)
              totalOrderTime += diff;
              countOrderTime++;
            }
          } catch (e) { console.warn(e); }
        }
      });

      // Top Month
      const sortedMonths = Object.entries(monthlyRevenue).sort((a, b) => b[1] - a[1]);
      const topMonth = sortedMonths.length > 0 ? sortedMonths[0][0] : "N/A";

      // Sort months strictly for chart (last 6 months)
      const last6Months = Object.entries(monthlyRevenue)
        .map(([key, val]) => {
          return { key, val };
        })
        .sort((a, b) => 0)
        .slice(0, 6);

      // Peak & Weak Days
      const sortedDays = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1]);
      const peakDay = sortedDays.length > 0 ? Number(sortedDays[0][0]) : 0;
      const weakDay = sortedDays.length > 0 ? Number(sortedDays[sortedDays.length - 1][0]) : 0;

      // Avg Prep Time Calculation (Refined)
      // Filter: Finished orders (ready/delivered) AND valid timestamps
      const validPrepOrders = completedOrders.filter(o =>
        o.preparation_started_at &&
        o.ready_at
      );

      let calcAvgPrepTime = -1;
      if (validPrepOrders.length > 0) {
        const totalDiff = validPrepOrders.reduce((acc, o) => {
          const start = new Date(o.preparation_started_at!).getTime();
          const end = new Date(o.ready_at!).getTime();
          return acc + ((end - start) / 60000);
        }, 0);
        calcAvgPrepTime = Math.round(totalDiff / validPrepOrders.length);
      }

      return {
        topMonth,
        peakDayName: weekDays[peakDay] || weekDays[0],
        weakDayName: weekDays[weakDay] || weekDays[0],
        avgPrepTime: calcAvgPrepTime, // Use the new calculated value
        avgOrderTime: countOrderTime > 0 ? Math.round(totalOrderTime / countOrderTime) : -1,
        monthlyRevenue, // For charts
        last6Months // Simplified
      };
    } catch (error) {
      console.error("Intelligence Error:", error);
      return {
        topMonth: "N/A",
        peakDayName: "N/A",
        weakDayName: "N/A",
        avgPrepTime: -1,
        avgOrderTime: -1,
        monthlyRevenue: {},
        last6Months: []
      };
    }
  };

  const intelligence = getIntelligenceData();

  // Top Flavors calculation (USING COMPLETED ORDERS ITEMS ONLY)
  const flavorStats: FlavorStat[] = completedOrderItems.reduce((acc: FlavorStat[], item) => {
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
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(192, 64, 0); // Primary Brand Color
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Tavares Pizzaria", 14, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Relatório de Inteligência - ${format(new Date(), "dd/MM/yyyy")}`, 14, 34);

    // --- Intelligence Summary ---
    let currentY = 55;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Insights de Performance (Vendas Concluídas)", 14, currentY);

    currentY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Suggestion Box
    doc.setDrawColor(192, 64, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, currentY, pageWidth - 28, 25, 3, 3);

    doc.setTextColor(192, 64, 0);
    doc.setFont("helvetica", "bold");
    doc.text("SUGESTÃO ESTRATÉGICA:", 18, currentY + 7);

    doc.setTextColor(60);
    doc.setFont("helvetica", "normal");
    const suggestionText = `Notamos que ${intelligence.weakDayName} é o dia com menor movimento. Sugerimos criar promoções específicas (ex: "Terça em Dobro" ou "Entrega Grátis") para este dia a fim de aumentar o faturamento. O seu pico de vendas ocorre na ${intelligence.peakDayName}.`;
    doc.text(doc.splitTextToSize(suggestionText, pageWidth - 40), 18, currentY + 14);

    currentY += 35;

    // Stats Grid
    const statBoxWidth = (pageWidth - 36) / 3;

    // Stat 1: Top Month
    doc.setFillColor(245, 245, 245);
    doc.rect(14, currentY, statBoxWidth, 20, "F");
    doc.setFontSize(8);
    doc.text("MÊS RECORD DE FATURAMENTO", 18, currentY + 6);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(intelligence.topMonth, 18, currentY + 15);

    // Stat 2: Avg Prep Time
    doc.setFillColor(245, 245, 245);
    doc.rect(14 + statBoxWidth + 4, currentY, statBoxWidth, 20, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TEMPO MÉDIO DE PREPARO", 18 + statBoxWidth + 4, currentY + 6);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(intelligence.avgPrepTime !== -1 ? `${intelligence.avgPrepTime} min` : "Dados insuf.", 18 + statBoxWidth + 4, currentY + 15);

    // Stat 3: Avg Order Time
    doc.setFillColor(245, 245, 245);
    doc.rect(14 + (statBoxWidth + 4) * 2, currentY, statBoxWidth, 20, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TEMPO TOTAL (PEDIDO -> ENTREGA)", 18 + (statBoxWidth + 4) * 2, currentY + 6);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(intelligence.avgOrderTime !== -1 ? `${intelligence.avgOrderTime} min` : "Dados insuf.", 18 + (statBoxWidth + 4) * 2, currentY + 15);

    currentY += 30;

    // --- Chart Section ---
    doc.setFontSize(14);
    doc.setTextColor(60);
    doc.text("Evolução do Faturamento (Últimos Meses)", 14, currentY);
    currentY += 10;

    // Draw Chart
    const chartHeight = 40;
    const chartWidth = pageWidth - 28;
    const chartBottomY = currentY + chartHeight;

    // Draw Axis
    doc.setDrawColor(200);
    doc.line(14, chartBottomY, 14 + chartWidth, chartBottomY); // X Axis
    doc.line(14, currentY, 14, chartBottomY); // Y Axis

    // Prepare data for last 6 months (chronological) based on orders
    const today = new Date();
    const last6MonthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = format(d, "MMM/yyyy", { locale: ptBR });
      const revenue = intelligence.monthlyRevenue[key] || 0;
      last6MonthsData.push({ label: key.split('/')[0], value: revenue });
    }

    const maxVal = Math.max(...last6MonthsData.map(d => d.value), 100); // Avoid div by zero
    const barWidth = (chartWidth / 6) - 4;

    last6MonthsData.forEach((data, index) => {
      const barHeight = (data.value / maxVal) * (chartHeight - 5);
      const x = 14 + 2 + (index * (chartWidth / 6));
      const y = chartBottomY - barHeight;

      doc.setFillColor(192, 64, 0);
      if (data.value > 0) {
        doc.rect(x, y, barWidth, barHeight, "F");
        // Value Label
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`R$${Math.round(data.value)}`, x, y - 2);
      }

      // X Axis Label
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text(data.label, x + (barWidth / 2), chartBottomY + 5, { align: "center" });
    });

    currentY += chartHeight + 20;

    // --- Tables ---

    // Revenue Summary
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Resumo Financeiro Detalhado (Apenas Concluídos)", 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
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
    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    const finalY1 = doc.lastAutoTable?.finalY || currentY + 40;
    doc.text("Top 5 Sabores Mais Vendidos", 14, finalY1 + 15);

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

    // --- NEW: REJECTED SUMMARY ---
    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    const finalYRejected = doc.lastAutoTable?.finalY || finalY1 + 50;
    doc.setTextColor(185, 28, 28); // Red color for attention
    doc.text("Relatório de Perdas / Pedidos Recusados", 14, finalYRejected + 15);

    autoTable(doc, {
      startY: finalYRejected + 20,
      head: [["Índice", "Valor", "Descrição"]],
      body: [
        ["Total Perdido", `R$ ${lostRevenue.toFixed(2).replace(".", ",")}`, "Receita não realizada"], // Fixed type coercion issue
        ["Qtd. Recusada", `${rejectedCount}`, "Pedidos cancelados"],
      ],
      theme: "striped",
      headStyles: { fillColor: [185, 28, 28] }, // Red header
    });

    // Top REJECTED Flavors
    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    const finalYRejectedFlavors = doc.lastAutoTable?.finalY || finalYRejected + 40;
    doc.setTextColor(60, 60, 60); // Reset color
    doc.setFontSize(10);
    doc.text("Top Sabores Recusados (Oportunidade de Melhoria)", 14, finalYRejectedFlavors + 10);

    autoTable(doc, {
      startY: finalYRejectedFlavors + 15,
      head: [["Sabor", "Qtd. Recusada", "Perda Estimada"]],
      body: topRejectedFlavors.map((f) => [
        f.name,
        f.quantity.toString(),
        `R$ ${f.revenue.toFixed(2).replace(".", ",")}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [100, 100, 100] }, // Grey header
    });


    // Order History - SHOWING ALL FOR AUDIT BUT MARKING STATUS
    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    const finalY2 = doc.lastAutoTable?.finalY || finalYRejectedFlavors + 50;
    doc.setFontSize(12);
    doc.text("Histórico Recente de Pedidos (Todos)", 14, finalY2 + 15);

    autoTable(doc, {
      startY: finalY2 + 20,
      head: [["Data", "Cliente", "Status", "Valor"]],
      body: orders.slice(0, 20).map((order) => [
        format(new Date(order.created_at), "dd/MM/yyyy HH:mm"),
        order.customer_name,
        statusLabels[order.status] || order.status,
        `R$ ${(order.total_amount || 0).toFixed(2).replace(".", ",")}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [192, 64, 0] },
    });

    // Save
    doc.save("relatorio-inteligente-tavares.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground">Relatório Inteligente</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Análise detalhada e insights para seu negócio</p>
          </div>
          <Button onClick={generatePDF} className="gap-2 bg-primary hover:bg-primary/90 shrink-0">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar PDF com Inteligência</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dia de Pico
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {intelligence.peakDayName}
              </div>
              <p className="text-xs text-muted-foreground">Maior volume de vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dia de <span className="text-red-400">Oportunidade</span>
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {intelligence.weakDayName}
              </div>
              <p className="text-xs text-muted-foreground">Menor movimento (Criar promoções)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Médio de Preparo
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {intelligence.avgPrepTime !== -1 ? `${intelligence.avgPrepTime} min` : "--"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Total (Pedido)
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {intelligence.avgOrderTime !== -1 ? `${intelligence.avgOrderTime} min` : "--"}
              </div>
            </CardContent>
          </Card>
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

        {/* Profit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {todayProfit.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Margem: {((todayProfit / (todayRevenue || 1)) * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {monthProfit.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Margem: {((monthProfit / (monthRevenue || 1)) * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalProfit.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Margem: {totalMargin.toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* --- KPI: LOST REVENUE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-red-200 bg-red-50/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-destructive">
                Prejuízo Evitado / Vendas Perdidas
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {lostRevenue.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de {rejectedCount} pedidos recusados/cancelados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Sabores Mais Recusados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topRejectedFlavors.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Sem dados de recusa</p>
              ) : (
                <div className="space-y-2">
                  {topRejectedFlavors.map((f, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{f.quantity}x {f.name}</span>
                      <span className="font-medium text-destructive">- R$ {f.revenue.toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
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
                        <TableCell className="font-mono text-xs">
                          {formatOrderNumber(order.display_id, order.id)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
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
                                  : order.status === "rejected" || order.status === "recusado" as any
                                    ? "destructive"
                                    : "default"
                            }
                          >
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold whitespace-nowrap">
                          R$ {(order.total_amount || 0).toFixed(2).replace(".", ",")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Reports;
