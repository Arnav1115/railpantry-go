import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
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
      toast.error('Failed to place order. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_35%),var(--background)] py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="glass-panel relative overflow-hidden rounded-[2rem] border-white/10 p-6 shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.10),transparent_30%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Review order</p>
              <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Confirm your tray</h1>
              <p className="mt-1 text-sm text-muted-foreground">A final check before your meal is securely dispatched.</p>
            </div>
            <Button variant="outline" onClick={onBack} className="h-12 rounded-full px-4 text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>

          <div className="mt-8 grid gap-5">
            <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-5 backdrop-blur-[18px] shadow-[0_30px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">Order summary</p>
                  <p className="text-sm text-muted-foreground">Your selected dishes at a glance.</p>
                </div>
                <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Review</div>
              </div>

              <div className="mt-6 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white/10 px-4 py-3 text-sm text-foreground shadow-sm shadow-slate-900/5">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-950/5 p-4 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div>
                <div className="flex justify-between"><span>Taxes & fees</span><span>₹{taxes}</span></div>
                <div className="flex justify-between text-base font-semibold text-foreground"><span>Total</span><span>₹{total + taxes}</span></div>
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-5 backdrop-blur-[18px] shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-muted-foreground">Delivery location</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{seat}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-1">PNR: {pnr}</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-bold text-lg disabled:opacity-70"
            >
              {submitting ? 'Placing order...' : `Pay ₹${total + taxes}`}
            </Button>
          </div>
        </div>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.12),transparent_30%),var(--background)] py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="glass-panel relative overflow-hidden rounded-[2rem] border-white/10 p-6 shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.10),transparent_28%)]" />
          <div className="relative space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Active order</p>
              <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Your meal is on the move</h1>
              <p className="mt-2 text-sm text-muted-foreground">Keep this verification code handy for delivery at your seat.</p>
            </div>

            <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-center shadow-sm shadow-slate-900/5">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-3">Delivery verification code</p>
              <div className="mx-auto mb-4 grid w-fit grid-cols-4 gap-3">
                {order.otp.split('').map((digit, index) => (
                  <div key={index} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/10 text-3xl font-heading font-bold text-foreground shadow-inner shadow-slate-900/10">
                    {digit}
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={copyOtp} className="mx-auto h-12 rounded-full px-5">
                {copied ? 'Copied!' : 'Copy code'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-5 shadow-sm shadow-slate-900/5">
                <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Order status</h2>
                <div className="space-y-3">
                  {statusSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/5 p-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${step.done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {step.done ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={`text-sm ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[1.75rem] border-white/10 bg-white/10 p-5 shadow-sm shadow-slate-900/5">
                <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Order summary</h2>
                <div className="space-y-3 text-sm text-foreground">
                  {(order.items as any[]).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between rounded-3xl bg-slate-950/5 p-3">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4 text-lg font-heading font-bold text-foreground flex items-center justify-between">
                  <span>Total</span>
                  <span>₹{order.total_price}</span>
                </div>
              </div>
            </div>

            <Button onClick={onNewOrder} className="w-full h-14 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-heading font-bold">
              Place new order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
