import { Link } from 'react-router-dom';
import { Utensils, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <Utensils className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground">RailPantry</h1>
          <p className="text-muted-foreground">Smart railway food management system</p>
        </div>

        <div className="space-y-4">
          <Link to="/passenger" className="block">
            <Button className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-lg rounded-xl">
              <Utensils className="mr-3 h-5 w-5" /> Passenger App <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
          </Link>
          <Link to="/admin" className="block">
            <Button variant="outline" className="w-full h-16 font-heading font-bold text-lg rounded-xl border-2">
              <Shield className="mr-3 h-5 w-5" /> Admin Dashboard <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 RailPantry · Logistics Systems</p>
      </div>
    </div>
  );
}
