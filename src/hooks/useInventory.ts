import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem } from '@/lib/types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data } = await supabase.from('inventory').select('*').order('category');
    if (data) setItems(data as InventoryItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        fetchItems();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStock = async (id: string, newQuantity: number) => {
    await supabase.from('inventory').update({ stock_quantity: newQuantity }).eq('id', id);
  };

  return { items, loading, updateStock, refetch: fetchItems };
}
