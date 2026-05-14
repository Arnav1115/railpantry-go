import { useState } from 'react';
import { Moon, ArrowLeft, Plus, Minus, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-indigo-300">Loading Night Menu...</div>;

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] pb-32 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 pt-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-indigo-200 active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-400 fill-indigo-400" />
              <h1 className="font-extrabold text-white leading-none">FoodOwl</h1>
            </div>
          </div>
          <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
            11 PM - 5 AM
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-20">
            <Moon className="w-24 h-24 fill-indigo-400 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-white mb-1">Silent Night Delivery</p>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-[85%]">
              We deliver quietly to your seat without waking up other passengers. Only essentials are available right now.
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-lg tracking-tight">Night Essentials</h2>
          
          {nightItems.length === 0 && (
            <p className="text-center text-indigo-300/50 py-12">No night essentials available right now.</p>
          )}

          {nightItems.map((item, index) => {
            const outOfStock = item.stock_quantity === 0;
            const qty = getCartQty(item.id);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className={`bg-white/5 rounded-3xl p-3 border border-white/10 flex gap-4 relative overflow-hidden backdrop-blur-md ${outOfStock ? 'opacity-40 grayscale-[0.8]' : ''}`}
              >
                <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white/5">
                  <img src={getFoodImage(item.name)} alt={item.name} className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                </div>

                <div className="flex-1 py-1 flex flex-col">
                  <h3 className="font-bold text-white text-base leading-tight mb-1">{item.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-indigo-300 mb-2 font-medium">
                    <Star className="w-3 h-3 fill-current" /> Fast Delivery
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-extrabold text-lg text-white">₹{item.price}</span>
                    
                    {outOfStock ? (
                      <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">Out of Stock</span>
                    ) : qty > 0 ? (
                      <div className="flex items-center bg-indigo-500/20 rounded-xl overflow-hidden border border-indigo-500/30">
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-indigo-300 active:bg-indigo-500/40">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-white">{qty}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-indigo-300 active:bg-indigo-500/40">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => addToCart(item)} 
                        className="h-8 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold active:scale-95 transition-all"
                      >
                        ADD
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <div className="bg-indigo-500 p-3 pl-5 rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.4)] flex items-center justify-between">
              <div>
                <p className="text-white font-bold">{cartCount} items selected</p>
                <p className="text-indigo-100 text-xs font-medium">₹{cartTotal} total</p>
              </div>
              <Button 
                onClick={() => onCheckout(cart)} 
                className="bg-white hover:bg-neutral-100 text-indigo-900 rounded-xl px-5 font-bold flex items-center gap-2 h-10"
              >
                Proceed <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
