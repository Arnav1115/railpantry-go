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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_35%),var(--background)] pb-28">
      <div className="sticky top-0 z-20 bg-transparent px-4 py-4">
        <div className="glass-panel border-white/10 bg-white/10 backdrop-blur-[20px] px-4 py-4 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="rounded-full border border-white/10 bg-white/10 p-2 text-foreground shadow-sm shadow-slate-900/10">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Late night pantry</p>
              <h1 className="font-heading text-xl font-bold text-foreground">FoodOwl 🦉</h1>
              <p className="text-sm text-muted-foreground">Essentials delivered seat-side while the train glides through the night.</p>
            </div>
            <Badge className="rounded-full bg-warning/15 text-warning border border-warning/20">Night Menu</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="glass-panel rounded-[2rem] border-white/10 bg-white/10 p-5 shadow-[0_32px_70px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Night essentials</p>
              <h2 className="mt-2 text-2xl font-heading font-bold text-foreground">Sustain your journey after dark</h2>
            </div>
            <div className="rounded-full bg-slate-950/10 px-4 py-2 text-sm font-semibold text-foreground shadow-sm shadow-slate-900/10">Fast delivery to your seat</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {nightItems.length === 0 && (
            <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-8 text-center text-muted-foreground shadow-sm shadow-slate-900/10">
              No night essentials are available right now. Please check back soon.
            </div>
          )}

          {nightItems.map(item => {
            const outOfStock = item.stock_quantity === 0;
            const qty = getCartQty(item.id);
            return (
              <div
                key={item.id}
                className={`glass-panel rounded-[1.75rem] border border-white/10 p-4 transition-transform duration-300 ${outOfStock ? 'opacity-60' : 'hover:-translate-y-1'} shadow-[0_24px_60px_rgba(15,23,42,0.08)]`}
              >
                <div className="flex gap-4">
                  <img
                    src={getFoodImage(item.name)}
                    alt={item.name}
                    loading="lazy"
                    className="h-20 w-20 rounded-3xl object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quick, warm, and ready for delivery at your seat.</p>
                    </div>
                    {outOfStock && (
                      <span className="mt-3 inline-flex rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-destructive">Out of stock</span>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold text-foreground">₹{item.price}</span>
                      {outOfStock ? (
                        <span className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Unavailable</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-2 rounded-full bg-slate-950/10 px-2 py-2">
                          <button onClick={() => removeFromCart(item.id)} className="h-10 w-10 rounded-full bg-white/10 text-foreground shadow-sm">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-7 text-center font-semibold text-foreground">{qty}</span>
                          <button onClick={() => addToCart(item)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button onClick={() => addToCart(item)} size="sm" className="rounded-full bg-warning text-warning-foreground hover:bg-warning/90 font-semibold">
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl shadow-[0_-20px_40px_rgba(15,23,42,0.18)]">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</p>
              <p className="text-lg font-semibold text-foreground">₹{cartTotal} total</p>
            </div>
            <Button onClick={() => onCheckout(cart)} className="h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-heading font-bold">
              Checkout <ShoppingCart className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
