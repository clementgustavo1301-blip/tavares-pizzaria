import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://szsbfpdmtcmsotmlahfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2JmcGRtdGNtc290bWxhaGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTM0MTQsImV4cCI6MjA4MDY4OTQxNH0.cNwaO02PGxqUCHaca-ar4edltQ4QCPa1Izw7jaxZYpc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface DbOrder {
  id: string;
  created_at: string;
  customer_name: string;
  address: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  pizza_name: string;
  quantity: number;
  price: number;
}
