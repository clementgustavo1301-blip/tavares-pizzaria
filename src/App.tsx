import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import Kitchen from "./pages/Kitchen";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import MenuManager from "./pages/MenuManager";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
            <Route path="/cozinha" element={<Kitchen />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin/cardapio" element={<MenuManager />} />
              <Route path="/admin/relatorios" element={<Reports />} />
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
