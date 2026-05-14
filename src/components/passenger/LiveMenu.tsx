import { useState } from 'react';
import { ShoppingCart, Plus, Minus, ArrowLeft, Moon, LogOut, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NightOwlBanner } from '@/components/NightOwlBanner';
import { useInventory } from '@/hooks/useInventory';
import { getFoodImage } from '@/lib/foodImages';
import type { CartItem } from '@/lib/types';

interface LiveMenuProps {
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
  onFoodOwl: () => void;
  onAI: () => void;
}

const categories = ['All Items', 'Meals', 'Snacks', 'Beverages'];

export function LiveMenu({ onCheckout, onBack, onFoodOwl, onAI }: LiveMenuProps) {
  const { items, loading } = useInventory();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = activeCategory === 'All Items' ? items : items.filter(i => i.category === activeCategory);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const hour = new Date().getHours();
  const isNight = hour >= 23 || hour < 5;

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack}><LogOut className="h-5 w-5 text-primary-foreground" /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-primary-foreground text-lg">Live Pantry Menu</h1>
          </div>
          <Badge className="bg-accent text-accent-foreground">Kitchen Open</Badge>
        </div>
      </div>

      {/* FoodOwl Night Banner */}
      {isNight && (
        <button onClick={onFoodOwl} className="w-full">
          <div className="mx-4 mt-4 bg-gradient-to-r from-[hsl(250,40%,20%)] to-[hsl(270,30%,15%)] rounded-xl p-4 flex items-center gap-3 border border-warning/30">
            <Moon className="h-8 w-8 text-warning" />
            <div className="text-left flex-1">
              <p className="font-heading font-bold text-primary-foreground">🦉 FoodOwl – Night Essentials</p>
              <p className="text-primary-foreground/60 text-xs">Tap to order water, biscuits, medicine & more</p>
            </div>
            <ArrowLeft className="h-5 w-5 text-warning rotate-180" />
          </div>
        </button>
      )}

      {/* Categories */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-4">
        <NightOwlBanner />
      </div>

      {/* Items */}
      <div className="px-4 space-y-3">
        {filtered.map(item => {
          const outOfStock = item.stock_quantity === 0;
          const qty = getCartQty(item.id);
          return (
            <div key={item.id} className={`bg-card rounded-xl p-4 border border-border flex gap-4 ${outOfStock ? 'opacity-50' : ''}`}>
              <img
                src={getFoodImage(item.name)}
                alt={item.name}
                loading="lazy"
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-card-foreground text-sm">{item.name}</h3>
                <div className="flex gap-2 mt-1">
                  {item.stock_quantity <= item.threshold && item.stock_quantity > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-medium">{item.stock_quantity} left</span>
                  )}
                  {outOfStock && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium">Out of Stock</span>
                  )}
                </div>
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
                    <Button onClick={() => addToCart(item)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-semibold">
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
        <div className="fixed bottom-0 left-0 right-0 bg-accent p-4 flex items-center justify-between">
          <span className="text-accent-foreground font-heading font-semibold">{cartCount} items added · ₹{cartTotal}</span>
          <Button onClick={() => onCheckout(cart)} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-heading font-bold rounded-lg">
            Review Order <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}
      {/* AI Assistant FAB */}
      <button
        onClick={onAI}
        className={`fixed right-4 ${cartCount > 0 ? 'bottom-20' : 'bottom-4'} z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105`}
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
}
