import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import Kitchen from "./pages/Kitchen";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import MenuManager from "./pages/MenuManager";
import StockControl from "./pages/StockControl";
import AdminPromotions from "./pages/AdminPromotions";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrderProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/:orderId" element={<OrderTracking />} />
            <Route path="/meus-pedidos" element={<MyOrders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Navigate to="/cozinha" replace />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/cozinha" element={<Kitchen />} />
                <Route path="/admin/cardapio" element={<MenuManager />} />
                <Route path="/admin/promocoes" element={<AdminPromotions />} />
                <Route path="/admin/relatorios" element={<Reports />} />
                <Route path="/admin/estoque" element={<StockControl />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OrderProvider>
  </QueryClientProvider>
);

export default App;
