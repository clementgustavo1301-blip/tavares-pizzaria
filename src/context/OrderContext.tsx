import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Pizza } from "@/data/pizzas";

export type OrderStatus = "aguardando" | "preparando" | "saiu" | "entregue";

export interface CartItem {
  pizza: Pizza;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerName: string;
  customerAddress: string;
  paymentMethod: string;
  createdAt: Date;
}

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  addToCart: (pizza: Pizza) => void;
  removeFromCart: (pizzaId: string) => void;
  updateQuantity: (pizzaId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerAddress: string, paymentMethod: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  cartTotal: number;
  cartItemsCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const addToCart = useCallback((pizza: Pizza) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.pizza.id === pizza.id);
      if (existing) {
        return prev.map((item) =>
          item.pizza.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { pizza, quantity: 1 }];
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
    (customerName: string, customerAddress: string, paymentMethod: string) => {
      const order: Order = {
        id: `PED-${Date.now().toString(36).toUpperCase()}`,
        items: [...cart],
        total: cartTotal,
        status: "aguardando",
        customerName,
        customerAddress,
        paymentMethod,
        createdAt: new Date(),
      };
      setOrders((prev) => [...prev, order]);
      setCurrentOrder(order);
      clearCart();
      return order;
    },
    [cart, cartTotal, clearCart]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    setCurrentOrder((prev) =>
      prev?.id === orderId ? { ...prev, status } : prev
    );
  }, []);

  const getOrderById = useCallback(
    (orderId: string) => orders.find((order) => order.id === orderId),
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{
        cart,
        orders,
        currentOrder,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        cartTotal,
        cartItemsCount,
      }}
    >
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
