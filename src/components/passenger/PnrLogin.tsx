import { useState } from 'react';
import { Utensils, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PnrLoginProps {
  onLogin: (pnr: string, seat: string) => void;
}

export function PnrLogin({ onLogin }: PnrLoginProps) {
  const [pnr, setPnr] = useState('');
  const [seat, setSeat] = useState('');

  const isValid = /^\d{10}$/.test(pnr) && seat.trim().length > 0;

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
            <Utensils className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary-foreground">RAILPANTRY LOGIN</h1>
          <p className="text-primary-foreground/80 text-sm font-heading font-semibold">Silent Food Ordering</p>
          <p className="text-primary-foreground/60 text-xs">Order hygienic meals directly to your seat without any disturbance.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-wide">Enter 10-Digit PNR</label>
            <Input
              value={pnr}
              onChange={e => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 1234567890"
              className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-lg tracking-widest"
            />
          </div>
          <div>
            <label className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-wide">Coach & Seat</label>
            <Input
              value={seat}
              onChange={e => setSeat(e.target.value)}
              placeholder="e.g. B4, Seat 42"
              className="mt-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
            />
          </div>
        </div>

        <Button
          onClick={() => onLogin(pnr, seat)}
          disabled={!isValid}
          className="w-full h-14 text-lg font-heading font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
        >
          CONTINUE TO MENU <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
