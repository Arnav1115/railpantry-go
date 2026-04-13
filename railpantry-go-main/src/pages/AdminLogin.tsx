import { useState } from 'react';
import { Shield, Lock, ArrowRight, Home, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';

const ADMIN_USER = 'Arnav1115';
const ADMIN_PASSWORD = 'Raj1115';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (username.trim() !== ADMIN_USER) {
      setError('Invalid operator username or login code.');
      return;
    }

    if (code.trim() !== ADMIN_PASSWORD) {
      setError('Invalid operator username or login code.');
      return;
    }

    setError('');

    localStorage.setItem('railpantry-admin-auth', 'true');
    localStorage.setItem('railpantry-admin-code', code.trim());
    localStorage.setItem('railpantry-admin-operator', username.trim());
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),transparent_28%),var(--background)] flex items-center justify-center p-6">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/15 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.15)] backdrop-blur-[24px]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_20%)]" />
        <div className="pointer-events-none absolute -right-16 top-8 h-52 w-52 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-14 bottom-10 h-44 w-44 rounded-full bg-orange-200/15 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-8 h-40 w-40 text-orange-300/20">
          <Train className="h-full w-full" />
        </div>
        <div className="relative space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-200/30 to-orange-300/20 text-orange-800 shadow-lg shadow-orange-300/20">
            <Shield className="h-8 w-8" />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-[0.24em] text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure operator access</span>
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground">RailPantry Control</h1>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">Secure operator login to manage inventory, orders and restock workflows.</p>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Operator username</label>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="operator"
              className="mt-3 bg-secondary/70 border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <Input
              value={code}
              onChange={e => setCode(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="mt-3 bg-secondary/70 border-white/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {error && <div className="rounded-3xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          <Button onClick={handleSubmit} className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold">
            Sign in <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <Link to="/" className="text-foreground hover:text-primary">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
