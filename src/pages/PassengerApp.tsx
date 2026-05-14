import { useState } from 'react';
import { PnrLogin } from '@/components/passenger/PnrLogin';
import { LiveMenu } from '@/components/passenger/LiveMenu';
import { FoodOwl } from '@/components/passenger/FoodOwl';
import { AgenticAI } from '@/components/passenger/AgenticAI';
import { Checkout, OrderConfirmation } from '@/components/passenger/Checkout';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { CartItem, Order } from '@/lib/types';

type Screen = 'login' | 'menu' | 'foodowl' | 'ai' | 'checkout' | 'confirmation';

export default function PassengerApp() {
  useOnlineStatus();
  const [screen, setScreen] = useState<Screen>('login');
  const [pnr, setPnr] = useState('');
  const [seat, setSeat] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);

  const handleLogin = (p: string, s: string) => { setPnr(p); setSeat(s); setScreen('menu'); };
  const handleCheckout = (c: CartItem[]) => { setCart(c); setScreen('checkout'); };
  const handleOrderDone = (o: Order) => { setOrder(o); setScreen('confirmation'); };
  const handleNewOrder = () => { setCart([]); setOrder(null); setScreen('menu'); };
  const handleLogout = () => { setPnr(''); setSeat(''); setCart([]); setOrder(null); setScreen('login'); };

  switch (screen) {
    case 'login': return <PnrLogin onLogin={handleLogin} />;
    case 'menu': return <LiveMenu onCheckout={handleCheckout} onBack={handleLogout} onFoodOwl={() => setScreen('foodowl')} onAI={() => setScreen('ai')} />;
    case 'ai': return <AgenticAI onCheckout={handleCheckout} onBack={() => setScreen('menu')} />;
    case 'foodowl': return <FoodOwl onCheckout={handleCheckout} onBack={() => setScreen('menu')} />;
    case 'checkout': return <Checkout cart={cart} pnr={pnr} seat={seat} onBack={() => setScreen('menu')} onDone={handleOrderDone} />;
    case 'confirmation': return order ? <OrderConfirmation order={order} onNewOrder={handleNewOrder} /> : null;
  }
}
