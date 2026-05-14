import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ArrowLeft, MapPin, ChefHat, Bike, Train, PackageCheck, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import type { CartItem, Order } from '@/lib/types';
import { toast } from 'sonner';

interface CheckoutProps {
  cart: CartItem[];
  pnr: string;
  seat: string;
  onBack: () => void;
  onDone: (order: Order) => void;
}

export function Checkout({ cart, pnr, seat, onBack, onDone }: CheckoutProps) {
  const { createOrder } = useOrders();
  const [submitting, setSubmitting] = useState(false);
  
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const taxes = Math.round(total * 0.05);
  const deliveryFee = 25;
  const finalTotal = total + taxes + deliveryFee;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const order = await createOrder(pnr, seat, cart, finalTotal);
      onDone(order);
    } catch {
      toast.error('Failed to place order');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 font-sans pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 pt-safe">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 active:scale-95 transition-transform">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-extrabold text-neutral-900 text-lg">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base mb-1">Delivery to Seat</h2>
              <p className="text-neutral-500 text-sm font-medium">Coach & Seat: <span className="text-neutral-900 font-bold">{seat}</span></p>
              <p className="text-neutral-400 text-xs mt-1">PNR: {pnr}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
          <h2 className="font-bold text-neutral-900 mb-4 flex items-center justify-between">
            Your Order <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Bhopal Jn</span>
          </h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-4 h-4 rounded-sm border border-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-neutral-500 font-medium">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-neutral-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Bill Details */}
          <div className="mt-6 pt-4 border-t border-dashed border-neutral-200 space-y-3">
            <div className="flex justify-between text-sm font-medium text-neutral-500">
              <span>Item Total</span><span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-neutral-500">
              <span>Delivery Partner Fee</span><span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-neutral-500">
              <span>Taxes & Platform Fees</span><span>₹{taxes}</span>
            </div>
            <div className="flex justify-between font-extrabold text-neutral-900 text-lg pt-3 border-t border-neutral-100">
              <span>To Pay</span><span>₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-100">
          <ShieldCheck className="text-green-600 w-6 h-6 shrink-0" />
          <p className="text-xs text-green-800 font-medium">100% hygienic food prepared under strict FSSAI guidelines. Secure delivery guaranteed.</p>
        </div>

      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 pb-safe">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          {submitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            `Pay ₹${finalTotal}`
          )}
        </Button>
      </div>
    </div>
  );
}

interface OrderConfirmationProps {
  order: Order;
  onNewOrder: () => void;
}

export function OrderConfirmation({ order, onNewOrder }: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [eta] = useState(25);

  const copyOtp = () => {
    navigator.clipboard.writeText(order.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { id: 'cooking', label: 'Preparing Order', icon: ChefHat },
    { id: 'packed', label: 'Order Packed', icon: PackageCheck },
    { id: 'rider', label: 'Rider Assigned', icon: Bike },
    { id: 'arriving', label: 'Train Arriving', icon: Train },
    { id: 'delivered', label: 'Delivered to Seat', icon: Check },
  ];

  // Derive mock progress from order status
  let currentStepIdx = 0;
  if (order.status === 'cooking') currentStepIdx = 1;
  if (order.status === 'delivered') currentStepIdx = 4;

  return (
    <div className="min-h-[100dvh] bg-neutral-50 font-sans pb-10">
      
      {/* Animated Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 pt-safe pb-8 px-6 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
          <Train className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-4 pt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
              <p className="text-orange-100 font-medium mb-1">Arriving in</p>
              <h1 className="text-5xl font-extrabold flex items-baseline gap-2">
                {eta} <span className="text-2xl font-bold text-orange-200">mins</span>
              </h1>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <p className="text-orange-50 text-sm font-medium">Your train is approaching Bhopal Jn.</p>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4 relative z-20">
        
        {/* OTP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 text-center">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Delivery Code</p>
          <h2 className="text-4xl font-extrabold text-neutral-900 tracking-[0.2em] mb-4">{order.otp}</h2>
          <Button onClick={copyOtp} variant="outline" className="h-10 rounded-xl px-6 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-bold border-neutral-200 w-full">
            {copied ? <><Check className="w-4 h-4 mr-2 text-green-500" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy Code</>}
          </Button>
          <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed">Please share this secure PIN with the delivery partner when they arrive at your seat.</p>
        </motion.div>

        {/* Live Tracking Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
          <h3 className="font-bold text-neutral-900 mb-6">Live Tracking</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors duration-500
                    ${isPast ? 'bg-orange-500 border-orange-100 text-white' : 
                      isActive ? 'bg-white border-orange-500 text-orange-500' : 'bg-neutral-100 border-white text-neutral-400'}`}>
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-orange-500 -z-10" />
                    )}
                  </div>
                  
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] px-4">
                    <div className={`flex flex-col ${isPast || isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      <span className="font-bold text-sm">{step.label}</span>
                      {isActive && <span className="text-xs text-orange-500 font-medium mt-0.5 animate-pulse">Happening now...</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <Button onClick={onNewOrder} variant="ghost" className="w-full text-neutral-500 font-bold mt-4">
          ← Back to Menu
        </Button>
      </div>
    </div>
  );
}
