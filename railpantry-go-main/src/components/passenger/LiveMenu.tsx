import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, LogOut, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NightOwlBanner } from '@/components/NightOwlBanner';
import { useInventory } from '@/hooks/useInventory';
import { getFoodImage } from '@/lib/foodImages';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

interface LiveMenuProps {
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
  onFoodOwl: () => void;
}

const categories = ['All Items', 'Meals', 'Snacks', 'Beverages'];

export function LiveMenu({ onCheckout, onBack, onFoodOwl }: LiveMenuProps) {
  const { items, loading } = useInventory();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = activeCategory === 'All Items' ? items : items.filter(i => i.category === activeCategory);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const [flipState, setFlipState] = useState<Record<string, boolean>>({});
  const prevCartCount = useRef(cartCount);

  const playChime = (frequency: number) => {
    if (typeof window === 'undefined') return;
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
  };

  const triggerFlip = (itemId: string) => {
    setFlipState(prev => ({ ...prev, [itemId]: true }));
    window.setTimeout(() => setFlipState(prev => ({ ...prev, [itemId]: false })), 380);
  };

  useEffect(() => {
    if (cartCount > 0 && prevCartCount.current === 0) {
      playChime(760);
      navigator.vibrate?.(10);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const hour = new Date().getHours();
  const isNight = hour >= 23 || hour < 5;
  const statusCopy = isNight ? 'Late-night pantry service for your sleeper coach.' : 'Browse fresh meal options and order directly to your seat.';

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    triggerFlip(item.id);
    navigator.vibrate?.(10);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
    triggerFlip(id);
    navigator.vibrate?.(10);
  };

  const getCartQty = (id: string) => cart.find(c => c.id === id)?.quantity || 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-background pb-28 page-fluid">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Onboard pantry</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Live Pantry Menu</h1>
              <p className="text-sm text-muted-foreground">{statusCopy}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-success/10 text-success border border-success/20">Kitchen Open</Badge>
              <span className="text-sm text-muted-foreground">Delivered in 15–30 min</span>
            </div>
            <Button variant="outline" onClick={onBack} className="h-11 rounded-full px-4 text-sm">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <NightOwlBanner className="rounded-[2rem] border border-border bg-card shadow-sm" />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => {
            const outOfStock = item.stock_quantity === 0;
            const lowStock = item.stock_quantity > 0 && item.stock_quantity <= item.threshold;
            const qty = getCartQty(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  'group rounded-[1.75rem] border border-white/20 bg-white/15 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-[18px]',
                  outOfStock
                    ? 'opacity-80 grayscale shadow-glow-red border-destructive/30'
                    : lowStock
                    ? 'shadow-glow-amber border-warning/30'
                    : 'hover:border-primary'
                )}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={getFoodImage(item.name)}
                    alt={item.name}
                    loading="lazy"
                    width={72}
                    height={72}
                    className="h-20 w-20 rounded-[1.75rem] object-cover transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-[1.03]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-semibold text-foreground truncate">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description || 'Delicious meal prepared on request.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lowStock && (
                        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-warning">{item.stock_quantity} left</span>
                      )}
                      {outOfStock && (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-destructive">Out of stock</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-foreground">₹{item.price}</span>
                  {outOfStock ? (
                    <span className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Unavailable</span>
                  ) : qty > 0 ? (
                    <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-2">
                      <button onClick={() => removeFromCart(item.id)} className="h-9 w-9 rounded-full bg-background text-foreground shadow-sm">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className={cn('w-7 text-center font-semibold text-foreground', flipState[item.id] && 'animate-split-flip')}>{qty}</span>
                      <button onClick={() => addToCart(item)} className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(item)} size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(15,23,42,0.10)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_20%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Meal status</p>
                <h2 className="text-xl font-semibold text-foreground">Isometric track progress</h2>
              </div>
              <div className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
                <Train className="h-4 w-4 text-primary" />
                {cartCount > 0 ? 'Order in motion' : 'Ready to select your meal'}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {['In Kitchen', 'En Route', 'At Seat'].map((stage, index) => (
                <div key={stage} className={cn(
                  'relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-center text-sm text-foreground shadow-[0_14px_40px_rgba(15,23,42,0.08)]',
                  index === 0
                    ? 'shadow-[0_0_0_14px_rgba(59,130,246,0.10)]'
                    : index === 1
                    ? 'shadow-[0_0_0_16px_rgba(16,185,129,0.10)]'
                    : 'shadow-[0_0_0_16px_rgba(34,197,94,0.08)]'
                )}>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-lg font-bold text-foreground">
                    {index + 1}
                  </div>
                  <p className="font-semibold">{stage}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {index === 0 ? 'Preparing your tray' : index === 1 ? 'Racing along the route' : 'Arriving to your seat'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/98 px-4 py-4 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</p>
              <p className="text-lg font-semibold text-foreground">₹{cartTotal} total</p>
            </div>
            <Button onClick={() => onCheckout(cart)} className="h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-heading font-bold">
              Continue to checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
