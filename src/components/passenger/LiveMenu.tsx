import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, ArrowLeft, Bot, Star, Clock, Flame, Tag, Leaf, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { getFoodImage } from '@/lib/foodImages';
import type { CartItem, InventoryItem } from '@/lib/types';

interface LiveMenuProps {
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
  onFoodOwl: () => void;
  onAI: () => void;
}

const categories = ['All', 'Thali', 'Biryani', 'Snacks', 'Beverages'];

export function LiveMenu({ onCheckout, onBack, onFoodOwl, onAI }: LiveMenuProps) {
  const { items, loading } = useInventory();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);

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

  // Mock enrichment
  const enrichedItems = useMemo(() => {
    return items.map(item => {
      const idNum = parseInt(item.id.replace(/\D/g, '') || '0') || item.name.length;
      return {
        ...item,
        isVeg: !item.name.toLowerCase().includes('chicken') && !item.name.toLowerCase().includes('egg'),
        rating: (4 + (idNum % 10) / 10).toFixed(1),
        reviews: 100 + (idNum % 500),
        eta: 15 + (idNum % 20), // 15-35 mins
        isBestseller: idNum % 3 === 0,
        station: idNum % 2 === 0 ? 'Bhopal Jn' : 'Itarsi Jn',
        discount: idNum % 4 === 0 ? '20% OFF' : null
      };
    });
  }, [items]);

  const filtered = activeCategory === 'All' 
    ? enrichedItems 
    : enrichedItems.filter(i => {
        if (activeCategory === 'Thali') return i.name.toLowerCase().includes('thali');
        if (activeCategory === 'Biryani') return i.name.toLowerCase().includes('biryani');
        if (activeCategory === 'Snacks') return i.category === 'Snacks';
        if (activeCategory === 'Beverages') return i.category === 'Beverages';
        return true;
      });

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-neutral-50 p-4 space-y-4 pt-12">
        <div className="h-8 bg-neutral-200 rounded-lg w-1/3 animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-neutral-200 rounded-full shrink-0 animate-pulse" />)}
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="bg-white p-4 rounded-3xl h-40 animate-pulse border border-neutral-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-neutral-50 pb-32 font-sans selection:bg-orange-200">
      
      {/* App Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 pt-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Delivering to</p>
              <h1 className="font-bold text-neutral-900 leading-none flex items-center gap-1">
                Seat 42, B4 <span className="text-neutral-300">|</span> <span className="text-neutral-500 text-sm">Train 12951</span>
              </h1>
            </div>
          </div>
          <button onClick={onAI} className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 active:scale-95 transition-transform relative overflow-hidden">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
            <Bot className="h-5 w-5 relative z-10" />
          </button>
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar pt-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Curated Section */}
        {activeCategory === 'All' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">Popular at upcoming stations</h2>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
              {enrichedItems.filter(i => i.isBestseller).map(item => (
                <div key={`pop-${item.id}`} className="w-64 shrink-0 bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col relative overflow-hidden">
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3">
                    <img src={getFoodImage(item.name)} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-neutral-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500" /> {item.eta} min
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 text-base leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-neutral-500 mb-3">{item.station}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-extrabold text-lg text-neutral-900">₹{item.price}</span>
                    <Button onClick={() => addToCart(item)} size="sm" className="h-8 px-4 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-full font-bold">
                      ADD
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vertical List */}
        <section>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-4">{activeCategory} Menu</h2>
          <div className="space-y-4">
            {filtered.map((item, index) => {
              const outOfStock = item.stock_quantity === 0;
              const qty = getCartQty(item.id);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className={`bg-white rounded-3xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 flex gap-4 relative overflow-hidden ${outOfStock ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  {/* Food Image */}
                  <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-neutral-100">
                    <img src={getFoodImage(item.name)} alt={item.name} className="w-full h-full object-cover" />
                    {item.discount && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-500 text-white text-[10px] font-bold text-center py-1">
                        {item.discount}
                      </div>
                    )}
                  </div>

                  {/* Food Details */}
                  <div className="flex-1 py-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      {item.isBestseller && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Bestseller</span>}
                    </div>

                    <h3 className="font-bold text-neutral-900 text-lg leading-tight mb-1">{item.name}</h3>
                    
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                      <span className="flex items-center text-yellow-500 font-bold"><Star className="w-3 h-3 fill-current mr-0.5" /> {item.rating}</span>
                      <span>({item.reviews})</span>
                      <span>•</span>
                      <span>{item.station}</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-extrabold text-lg text-neutral-900">₹{item.price}</span>
                      
                      {outOfStock ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">Out of Stock</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center bg-orange-50 rounded-xl overflow-hidden border border-orange-100 shadow-sm">
                          <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 flex items-center justify-center text-orange-600 active:bg-orange-100">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-orange-600">{qty}</span>
                          <button onClick={() => addToCart(item)} className="w-9 h-9 flex items-center justify-center text-orange-600 active:bg-orange-100">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart(item)} 
                          className="h-9 px-6 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl font-extrabold shadow-sm active:scale-95 transition-all"
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
        </section>

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
            <div className="bg-neutral-900 p-3 pl-5 rounded-2xl shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-white font-bold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                <p className="text-neutral-400 text-xs font-medium">Extra charges may apply</p>
              </div>
              <Button 
                onClick={() => onCheckout(cart)} 
                className="bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl px-6 font-bold flex items-center gap-2 h-12"
              >
                View Cart <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
