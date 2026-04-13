import { useState } from 'react';
import { Utensils, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

interface PnrLoginProps {
  onLogin: (pnr: string, seat: string) => void;
}

export function PnrLogin({ onLogin }: PnrLoginProps) {
  const [pnr, setPnr] = useState('');
  const [seat, setSeat] = useState('');

  const isValid = /^\d{10}$/.test(pnr) && seat.trim().length > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.22),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.16),transparent_30%),var(--background)] flex items-center justify-center p-6 page-fluid">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-[24px] shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-44 w-44 rounded-full bg-orange-200/15 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-6 h-36 w-36 text-orange-300/20">
          <Utensils className="h-full w-full" />
        </div>
        <div className="relative space-y-3">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-primary-foreground/10 flex items-center justify-center">
            <Utensils className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">RailPantry Login</h1>
          <p className="text-sm font-semibold text-muted-foreground">Silent food ordering for train passengers.</p>
          <p className="text-xs text-muted-foreground/80">Enter your PNR and seat to access the live pantry menu.</p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enter 10-digit PNR</label>
            <Input
              value={pnr}
              onChange={e => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 1234567890"
              className="mt-2 bg-secondary/70 border-border text-foreground placeholder:text-muted-foreground text-lg tracking-widest"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coach & Seat</label>
            <Input
              value={seat}
              onChange={e => setSeat(e.target.value)}
              placeholder="e.g. B4, Seat 42"
              className="mt-2 bg-secondary/70 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-secondary/80 p-4 text-sm text-muted-foreground">
          <p className="mb-3 font-semibold text-foreground">Quick start</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">1</span>
              Fill in your PNR and seat details.
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">2</span>
              Browse the fresh live menu.
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">3</span>
              Confirm your order and track delivery.
            </div>
          </div>
        </div>

        <Button
          onClick={() => onLogin(pnr, seat)}
          disabled={!isValid}
          className="mt-6 w-full h-14 rounded-xl bg-accent text-accent-foreground font-heading font-bold text-lg hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue to menu <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <div className="mt-4 pt-2 border-t border-border text-center">
          <Link to="/admin" className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <Shield className="mr-2 h-4 w-4" /> Admin login →
          </Link>
        </div>
      </div>
    </div>
  );
}
