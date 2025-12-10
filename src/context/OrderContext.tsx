import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Pizza } from "@/data/pizzas";
import { supabase, DbOrder, DbOrderItem, OrderStatus as DbOrderStatus } from "@/integrations/supabase/client";

export type OrderStatus = "aguardando" | "preparando" | "saiu" | "entregue";

export interface CartItem {
  pizza: Pizza;
  quantity: number;
  observation?: string;
  crust?: string;
}

export interface Order {
  id: string;
  displayId?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerName: string;
  customerAddress: string;
  paymentMethod: string;
  createdAt: Date;
  preparationStartAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
}

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  addToCart: (pizza: Pizza, observation?: string, crust?: string) => void;
  removeFromCart: (pizzaId: string) => void;
  updateQuantity: (pizzaId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerAddress: string, paymentMethod: string, cpf: string, deliveryType: "delivery" | "pickup") => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  cartTotal: number;
  cartItemsCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Map between frontend and database status
const statusToDb: Record<OrderStatus, DbOrderStatus> = {
  aguardando: "pending",
  preparando: "preparing",
  saiu: "ready",
  entregue: "delivered",
};

const statusFromDb: Record<DbOrderStatus, OrderStatus> = {
  pending: "aguardando",
  preparing: "preparando",
  ready: "saiu",
  delivered: "entregue",
};

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Fetch all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*");

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        return;
      }

      // Map database orders to frontend format
      const mappedOrders: Order[] = ordersData.map((dbOrder: DbOrder) => {
        const orderItems = (itemsData || []).filter(
          (item: DbOrderItem) => item.order_id === dbOrder.id
        );

        return {
          id: dbOrder.id,
          displayId: dbOrder.display_id || undefined,
          customerName: dbOrder.customer_name,
          customerAddress: dbOrder.address || "",
          total: dbOrder.total_amount,
          status: statusFromDb[dbOrder.status as DbOrderStatus] || "aguardando",
          paymentMethod: dbOrder.payment_method,
          createdAt: new Date(dbOrder.created_at),
          preparationStartAt: dbOrder.preparation_started_at ? new Date(dbOrder.preparation_started_at) : undefined,
          readyAt: dbOrder.ready_at ? new Date(dbOrder.ready_at) : undefined,
          deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
          items: orderItems.map((item: DbOrderItem) => ({
            pizza: {
              id: item.id,
              name: item.pizza_name,
              price: item.price,
              description: "",
              ingredients: [],
              image: "",
            },
            quantity: item.quantity,
            observation: item.observations || undefined,
          })),
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error in fetchOrders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const addToCart = useCallback((pizza: Pizza, observation?: string, crust?: string) => {
    setCart((prev) => {
      // Create a unique key for grouping (id + obs + crust)
      const isSameItem = (item: CartItem) =>
        item.pizza.id === pizza.id &&
        item.observation === observation &&
        item.crust === crust;

      const existing = prev.find(isSameItem);

      if (existing) {
        return prev.map((item) =>
          isSameItem(item)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { pizza, quantity: 1, observation, crust }];
    });
  }, []);

  const removeFromCart = useCallback((pizzaId: string) => {
    setCart((prev) => prev.filter((item) => item.pizza.id !== pizzaId));
  }, []);

  const updateQuantity = useCallback((pizzaId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(pizzaId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.pizza.id === pizzaId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.pizza.price * item.quantity,
    0
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = useCallback(
    async (customerName: string, customerAddress: string, paymentMethod: string, cpf: string, deliveryType: "delivery" | "pickup"): Promise<Order> => {
      // Prepare payload with correct column names and types
      const orderPayload = {
        customer_name: customerName,
        address: customerAddress,
        total_amount: Number(cartTotal),
        status: "pending" as const,
        payment_method: paymentMethod,
        cpf: cpf,
        delivery_type: deliveryType,
      };

      console.log("Inserting order with payload:", orderPayload);

      // Insert order into Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError.message, orderError.details);
        throw new Error("Erro ao criar pedido");
      }

      // Insert order items with correct types
      const orderItems = cart.map((item) => {
        let finalObservation = item.observation || "";
        if (item.crust) {
          finalObservation = finalObservation
            ? `Borda: ${item.crust}. ${finalObservation}`
            : `Borda: ${item.crust}`;
        }

        return {
          order_id: orderData.id,
          pizza_name: String(item.pizza.name),
          quantity: Number(item.quantity) || 1,
          price: Number(item.pizza.price),
          observations: finalObservation || null,
        };
      });

      console.log("Items Payload:", orderItems);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw new Error("Erro ao criar itens do pedido");
      }

      const order: Order = {
        id: orderData.id,
        displayId: orderData.display_id || undefined,
        items: [...cart],
        total: cartTotal,
        status: "aguardando",
        customerName,
        customerAddress,
        paymentMethod,
        createdAt: new Date(orderData.created_at),
      };

      setCurrentOrder(order);
      clearCart();

      // Refresh orders list
      await fetchOrders();

      return order;
    },
    [cart, cartTotal, clearCart, fetchOrders]
  );

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    const updates: any = { status: statusToDb[status] };

    // Refactored logic to include timestamps based on status
    if (status === "preparando") {
      updates.preparation_started_at = now;
    } else if (status === "saiu") {
      updates.ready_at = now;
    } else if (status === "entregue") {
      updates.delivered_at = now;
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error("Erro ao atualizar status");
    }

    // Update local state immediately for responsiveness
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status };
          if (status === "preparando") updatedOrder.preparationStartAt = new Date();
          if (status === "saiu") updatedOrder.readyAt = new Date();
          if (status === "entregue") updatedOrder.deliveredAt = new Date();
          return updatedOrder;
        }
        return order;
      })
    );
    setCurrentOrder((prev) => {
      if (prev?.id === orderId) {
        const updatedOrder = { ...prev, status };
        if (status === "preparando") updatedOrder.preparationStartAt = new Date();
        if (status === "saiu") updatedOrder.readyAt = new Date();
        if (status === "entregue") updatedOrder.deliveredAt = new Date();
        return updatedOrder;
      }
      return prev;
    });
  }, []);

  const getOrderById = useCallback(
    (orderId: string) => orders.find((order) => order.id === orderId),
    [orders]
  );

  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    await fetchOrders();
  }, [fetchOrders]);

  const value = React.useMemo(() => ({
    cart,
    orders,
    currentOrder,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    updateOrderStatus,
    getOrderById,
    refreshOrders,
    cartTotal,
    cartItemsCount,
  }), [
    cart,
    orders,
    currentOrder,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    updateOrderStatus,
    getOrderById,
    refreshOrders,
    cartTotal,
    cartItemsCount
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
