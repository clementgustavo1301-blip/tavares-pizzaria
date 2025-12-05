import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Kitchen from "./pages/Kitchen";
import NotFound from "./pages/NotFound";

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
            <Route path="/cozinha" element={<Kitchen />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OrderProvider>
  </QueryClientProvider>
);

export default App;
