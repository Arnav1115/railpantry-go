import { useState } from 'react';
import { Check, Copy, ArrowLeft } from 'lucide-react';
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const order = await createOrder(pnr, seat, cart, total + taxes);
      onDone(order);
    } catch {
      toast.error('Failed to place order');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary p-4 flex items-center gap-3">
        <button onClick={onBack}><ArrowLeft className="h-5 w-5 text-primary-foreground" /></button>
        <h1 className="font-heading font-bold text-primary-foreground text-lg">Review Order</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-heading font-semibold text-card-foreground">Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-card-foreground">{item.name} × {item.quantity}</span>
              <span className="text-card-foreground font-semibold">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sub Total</span><span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxes & Fees</span><span>₹{taxes}</span>
            </div>
            <div className="flex justify-between font-heading font-bold text-card-foreground text-lg pt-2">
              <span>Total</span><span>₹{total + taxes}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Delivering to</p>
          <p className="font-heading font-semibold text-card-foreground">{seat}</p>
          <p className="text-xs text-muted-foreground mt-1">PNR: {pnr}</p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-bold text-lg rounded-xl"
        >
          {submitting ? 'Placing Order...' : `Pay ₹${total + taxes}`}
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

  const copyOtp = () => {
    navigator.clipboard.writeText(order.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusSteps = [
    { label: 'Order Confirmed', done: true },
    { label: 'Preparing Order', done: order.status !== 'pending' },
    { label: 'Out for Delivery', done: order.status === 'delivered' },
    { label: 'Delivered', done: order.status === 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary p-4">
        <h1 className="font-heading font-bold text-primary-foreground text-lg">Active Order</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Delivery Verification</p>
          <p className="text-xs text-muted-foreground mb-3">Show this code to the server after receiving your order.</p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-2">
              {order.otp.split('').map((d, i) => (
                <div key={i} className="w-12 h-14 bg-secondary rounded-lg flex items-center justify-center text-2xl font-heading font-bold text-foreground">{d}</div>
              ))}
            </div>
            <button onClick={copyOtp} className="ml-2 p-2 rounded-lg bg-secondary">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-heading font-semibold text-card-foreground mb-4">Track Order</h2>
          <div className="space-y-4">
            {statusSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-success' : 'bg-muted'}`}>
                  {step.done && <Check className="h-3 w-3 text-success-foreground" />}
                </div>
                <span className={`text-sm ${step.done ? 'text-card-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-heading font-semibold text-card-foreground mb-2">Order Summary</h2>
          {(order.items as any[]).map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span className="text-card-foreground">{item.name} × {item.quantity}</span>
              <span className="text-card-foreground">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-heading font-bold text-card-foreground">
            <span>Total</span><span>₹{order.total_price}</span>
          </div>
        </div>

        <Button onClick={onNewOrder} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-heading rounded-xl">
          Place New Order
        </Button>
      </div>
    </div>
  );
}
