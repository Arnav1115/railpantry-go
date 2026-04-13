import { Link } from 'react-router-dom';
import { Utensils, Shield, ArrowRight, Sparkles, MapPin, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { title: 'Seat delivery', description: 'Fresh meals delivered quietly to your berth with live updates.', icon: MapPin },
  { title: 'Fast checkout', description: 'Secure ordering and payment with one tap from your seat.', icon: Clock3 },
  { title: 'Contactless service', description: 'Minimal contact, maximum safety while onboard.', icon: Sparkles },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.12),transparent_28%),var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-[2rem] border border-border bg-card/95 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Utensils className="h-4 w-4" /> On-board pantry for rail travelers
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">RailPantry</h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Smart railway food management with live menus, seat delivery, and contactless ordering designed for every passenger.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/passenger" className="block">
                <Button className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-lg rounded-xl shadow-sm shadow-primary/20">
                  <Utensils className="mr-3 h-5 w-5" /> Passenger App <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
              </Link>
              <Link to="/admin" className="block">
                <Button variant="outline" className="w-full h-16 font-heading font-bold text-lg rounded-xl border-2 border-border text-foreground hover:border-primary hover:text-primary">
                  <Shield className="mr-3 h-5 w-5" /> Admin Dashboard <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-border bg-secondary/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Why RailPantry?</p>
            <div className="space-y-3">
              {features.map(feature => {
                const Icon = feature.icon as any;
                return (
                  <div key={feature.title} className="flex items-start gap-4 rounded-3xl bg-card p-4 shadow-sm">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">© 2026 RailPantry · Logistics Systems</p>
          </div>
        </div>
      </div>
    </div>
  );
}
