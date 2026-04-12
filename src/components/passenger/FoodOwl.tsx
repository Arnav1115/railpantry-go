import { useState } from 'react';
import { Moon, ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { getFoodImage } from '@/lib/foodImages';
import type { CartItem } from '@/lib/types';

interface FoodOwlProps {
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
}

const nightEssentials = ['water', 'biscuit', 'medicine', 'ors', 'chips', 'namkeen', 'bread', 'milk', 'juice'];

export function FoodOwl({ onCheckout, onBack }: FoodOwlProps) {
  const { items, loading } = useInventory();
  const [cart, setCart] = useState<CartItem[]>([]);

  const nightItems = items.filter(i =>
    nightEssentials.some(keyword => i.name.toLowerCase().includes(keyword))
  );

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  };

  const getCartQty = (id: string) => cart.find(c => c.id === id)?.quantity || 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[hsl(250,40%,20%)] to-[hsl(270,30%,15%)] p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack}><ArrowLeft className="h-5 w-5 text-primary-foreground" /></button>
          <Moon className="h-5 w-5 text-warning" />
          <div className="flex-1">
            <h1 className="font-heading font-bold text-primary-foreground text-lg">FoodOwl 🦉</h1>
            <p className="text-primary-foreground/60 text-xs">Late night essentials delivered to your seat</p>
          </div>
          <Badge className="bg-warning/20 text-warning border border-warning/30">Night Menu</Badge>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 bg-warning/10 border border-warning/20 rounded-xl p-3 flex items-start gap-3">
        <Moon className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-heading font-semibold text-foreground">Night Owl Essentials</p>
          <p className="text-xs text-muted-foreground">Only essential items are available between 11 PM – 5 AM. Stay hydrated and energized!</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 mt-4 space-y-3">
        {nightItems.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No night essentials available right now.</p>
        )}
        {nightItems.map(item => {
          const outOfStock = item.stock_quantity === 0;
          const qty = getCartQty(item.id);
          return (
            <div key={item.id} className={`bg-card rounded-xl p-4 border border-border flex gap-4 ${outOfStock ? 'opacity-50' : ''}`}>
              <img
                src={getFoodImage(item.name)}
                alt={item.name}
                loading="lazy"
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-card-foreground text-sm">{item.name}</h3>
                {outOfStock && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium">Out of Stock</span>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-heading font-bold text-card-foreground">₹{item.price}</span>
                  {outOfStock ? (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  ) : qty > 0 ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Minus className="h-4 w-4 text-secondary-foreground" />
                      </button>
                      <span className="font-bold text-card-foreground w-6 text-center">{qty}</span>
                      <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Plus className="h-4 w-4 text-primary-foreground" />
                      </button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(item)} size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 rounded-lg font-semibold">
                      ADD
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-warning p-4 flex items-center justify-between">
          <span className="text-warning-foreground font-heading font-semibold">{cartCount} items · ₹{cartTotal}</span>
          <Button onClick={() => onCheckout(cart)} className="bg-foreground text-background hover:bg-foreground/90 font-heading font-bold rounded-lg">
            Checkout <ShoppingCart className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
