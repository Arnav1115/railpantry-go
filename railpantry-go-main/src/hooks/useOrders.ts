import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderItem } from '@/lib/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data.map(o => ({ ...o, items: o.items as unknown as OrderItem[], status: o.status as Order['status'] })));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
  };

  const createOrder = async (pnr: string, seat: string, items: OrderItem[], total: number) => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const { data, error } = await supabase.from('orders').insert({
      pnr_number: pnr,
      coach_seat: seat,
      items: items as any,
      total_price: total,
      otp,
    }).select().single();
    if (error) throw error;
    // Reduce stock
    for (const item of items) {
      const { data: inv } = await supabase.from('inventory').select('stock_quantity').eq('id', item.id).single();
      if (inv) {
        await supabase.from('inventory').update({ stock_quantity: Math.max(0, inv.stock_quantity - item.quantity) }).eq('id', item.id);
      }
    }
    return data as unknown as Order;
  };

  return { orders, loading, updateOrderStatus, createOrder, refetch: fetchOrders };
}
