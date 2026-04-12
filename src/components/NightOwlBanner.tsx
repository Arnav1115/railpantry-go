import { Moon } from 'lucide-react';

export function NightOwlBanner() {
  const hour = new Date().getHours();
  const isNight = hour >= 23 || hour < 5;
  if (!isNight) return null;

  return (
    <div className="bg-secondary border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
      <Moon className="h-5 w-5 text-warning shrink-0" />
      <div>
        <p className="text-sm font-heading font-semibold text-foreground">Night-Owl Mode</p>
        <p className="text-xs text-muted-foreground">Limited menu available. Essentials: Water, Biscuits, ORS, Medicine.</p>
      </div>
    </div>
  );
}
