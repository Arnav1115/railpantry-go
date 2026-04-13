import { useEffect, useRef, useState } from 'react';
import { Package, ClipboardList, Truck, Train, RefreshCw, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { NightOwlBanner } from '@/components/NightOwlBanner';
import { popularTrains, searchTrains, type TrainRoute } from '@/lib/indianRailwaysData';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';

type Tab = 'inventory' | 'orders' | 'restock' | 'tracking';

interface RestockRequest {
  id: string;
  station: string;
  stationIndex: number;
  items: Record<string, number>;
  createdAt: number;
  trainRoute: TrainRoute;
}

export default function AdminDashboard() {
  useOnlineStatus();
  const { items, loading: invLoading, updateStock } = useInventory();
  const { orders, loading: ordLoading, updateOrderStatus } = useOrders();
  const [tab, setTab] = useState<Tab>('inventory');
  const [otpInput, setOtpInput] = useState('');
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);

  // Restock state
  const [trainInput, setTrainInput] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<TrainRoute | null>(null);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [restockStation, setRestockStation] = useState<string | null>(null);
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});
  
  // Restock tracking state
  const [activeRestocks, setActiveRestocks] = useState<RestockRequest[]>([]);
  const [showTrackingTab, setShowTrackingTab] = useState(false);
  const [trainSearchSuggestions, setTrainSearchSuggestions] = useState<TrainRoute[]>([]);

  const playChime = (frequency: number) => {
    if (typeof window === 'undefined') return;
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  };

  const sendHeavyHaptic = () => {
    if (typeof window !== 'undefined') navigator.vibrate?.([40, 20, 40]);
  };

  const handleDeliver = (order: Order) => {
    setDeliverOrderId(order.id);
    setOtpInput('');
  };

  const confirmOtp = (order: Order) => {
    if (otpInput === order.otp) {
      updateOrderStatus(order.id, 'delivered');
      setDeliverOrderId(null);
      toast.success('Order delivered!');
    } else {
      toast.error('Invalid OTP');
    }
  };

  const handleSearchTrain = async () => {
    // Search using Indian Railways database
    const results = await searchTrains(trainInput.trim());
    if (results.length > 0) {
      setSelectedRoute(results[0]);
      setCurrentStationIdx(0);
      setTrainSearchSuggestions([]);
      toast.success(`Found: ${results[0].trainName}`);
    } else {
      toast.error('Train not found. Try searching with train number or name.');
    }
  };

  const handleTrainInputChange = async (val: string) => {
    setTrainInput(val);
    if (val.trim().length > 0) {
      const suggestions = await searchTrains(val);
      setTrainSearchSuggestions(suggestions);
    } else {
      setTrainSearchSuggestions([]);
    }
  };

  const handleRestock = async () => {
    if (!selectedRoute || !restockStation) return;
    
    // Find the restock station index
    const stationIdx = selectedRoute.stations.indexOf(restockStation);
    
    // Create restock request and add to tracking
    const newRequest: RestockRequest = {
      id: `restock-${Date.now()}`,
      station: restockStation,
      stationIndex: stationIdx,
      items: { ...restockItems },
      createdAt: Date.now(),
      trainRoute: selectedRoute,
    };
    
    setActiveRestocks(prev => [...prev, newRequest]);
    
    sendHeavyHaptic();
    playChime(520);
    toast.success(`Restock request tracked for ${restockStation}!`);
    setRestockStation(null);
    setRestockItems({});
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('railpantry-admin-auth');
    localStorage.removeItem('railpantry-admin-code');
    localStorage.removeItem('railpantry-admin-code-id');
    localStorage.removeItem('railpantry-admin-operator');
    localStorage.removeItem('railpantry-admin-train');
    navigate('/admin/login');
  };

  const handleCompleteRestock = async (restockId: string) => {
    const restock = activeRestocks.find(r => r.id === restockId);
    if (!restock) return;

    // Add items to inventory
    for (const [id, qty] of Object.entries(restock.items)) {
      if (qty > 0) {
        const item = items.find(i => i.id === id);
        if (item) await updateStock(id, item.stock_quantity + qty);
      }
    }

    // Remove from tracking
    setActiveRestocks(prev => prev.filter(r => r.id !== restockId));
    sendHeavyHaptic();
    playChime(620);
    toast.success(`Restock completed at ${restock.station}!`);
  };

  const calculateStopsAwayAndTime = (request: RestockRequest, currentIdx: number) => {
    const stopsAway = request.stationIndex - currentIdx;
    const minutesPerStop = 35; // Average 35 minutes per stop
    const estimatedMinutes = stopsAway * minutesPerStop;
    const hours = Math.floor(estimatedMinutes / 60);
    const mins = estimatedMinutes % 60;
    
    return {
      stopsAway,
      estimatedTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
    };
  };

  const sideItems = [
    { id: 'inventory' as Tab, label: 'Main Inventory', icon: Package },
    { id: 'orders' as Tab, label: 'Order Queue', icon: ClipboardList },
    { id: 'restock' as Tab, label: 'Station Restock', icon: Truck },
    { id: 'tracking' as Tab, label: 'Restock Tracking', icon: Train },
  ];

  const [currentAdminCode, setCurrentAdminCode] = useState<{ id: string; code: string; train_number: string | null; active: boolean } | null>(null);
  const pendingOrders = orders.filter(o => o.status !== 'delivered');
  const nextStations = selectedRoute ? selectedRoute.stations.slice(currentStationIdx + 1) : [];
  const prevPendingOrders = useRef(pendingOrders.length);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('railpantry-admin-auth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (pendingOrders.length > prevPendingOrders.current) {
      playChime(720);
    }
    prevPendingOrders.current = pendingOrders.length;
  }, [pendingOrders.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Admin control center</p>
              <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">RailPantry operations dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">Monitor inventory, manage active orders, and coordinate station restock requests.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="rounded-full bg-success/10 text-success border border-success/20">Live supply</Badge>
              <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20">Connected</Badge>
            </div>
          </div>
        </div>

        <div className="glass-panel relative overflow-hidden mb-6 rounded-[2rem] border border-white/15 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
          <div className="pointer-events-none absolute -right-10 top-2 h-40 w-40 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="pointer-events-none absolute left-6 top-8 h-28 w-28 rounded-full bg-orange-200/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-y-0 right-8 hidden h-full w-[260px] text-orange-200/20 md:block">
            <Train className="h-full w-full" />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Admin Console</p>
              <p className="text-xs text-muted-foreground">Keep your admin screens clean and focused.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex flex-wrap gap-2">
                {sideItems.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setTab(s.id)}
                    className={cn(
                      'floating-tab transform-gpu rounded-full px-4 py-2 text-sm font-medium shadow-lg shadow-slate-900/10 transition duration-300 relative',
                      tab === s.id
                        ? 'bg-primary text-primary-foreground shadow-primary/25'
                        : 'bg-white/10 text-foreground hover:bg-white/20'
                    )}
                  >
                    <s.icon className="mr-2 inline-block h-4 w-4" />
                    {s.label}
                    {s.id === 'tracking' && activeRestocks.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                        {activeRestocks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <Button onClick={handleLogout} variant="outline" className="floating-tab rounded-full px-4 py-2 text-sm shadow-lg shadow-slate-900/10">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </div>

        <NightOwlBanner />

        {tab === 'inventory' && (
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Inventory ERP Overview</h1>
            <p className="text-muted-foreground text-sm mb-6">Manage network-wide stock levels and supply chain health.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Active SKUs" value={items.length} />
              <StatCard label="Low Stock Items" value={items.filter(i => i.stock_quantity > 0 && i.stock_quantity <= i.threshold).length} accent="warning" />
              <StatCard label="Out of Stock" value={items.filter(i => i.stock_quantity === 0).length} accent="destructive" />
              <StatCard label="Total Inventory Value" value={`₹${items.reduce((s, i) => s + i.price * i.stock_quantity, 0).toLocaleString()}`} />
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => {
                const outOfStock = item.stock_quantity === 0;
                const lowStock = item.stock_quantity > 0 && item.stock_quantity <= item.threshold;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl p-5 transition-all',
                      outOfStock
                        ? 'border border-destructive bg-destructive/10 shadow-glow-red animate-critical-glow'
                        : lowStock
                        ? 'border border-warning bg-warning/5 shadow-glow-amber animate-warning-glow'
                        : 'bg-card border-border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-card-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      {outOfStock && <Badge className="bg-destructive text-destructive-foreground">OUT</Badge>}
                      {lowStock && <Badge className="bg-warning text-warning-foreground">LOW</Badge>}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-heading font-bold text-card-foreground">{item.stock_quantity}</p>
                        <p className="text-xs text-muted-foreground">units · ₹{item.price}/unit</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStock(item.id, Math.max(0, item.stock_quantity - 1))}
                          className="h-10 w-10 p-0"
                        >-</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStock(item.id, item.stock_quantity + 1)}
                          className="h-10 w-10 p-0"
                        >+</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Order Management Queue</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Active Orders" value={pendingOrders.length} />
              <StatCard label="Completed Today" value={orders.filter(o => o.status === 'delivered').length} accent="success" />
            </div>

            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <p className="font-heading font-semibold text-card-foreground">PNR: {order.pnr_number}</p>
                      <p className="text-sm text-muted-foreground">{order.coach_seat} · ₹{order.total_price}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(order.items as any[]).map((item: any, i: number) => (
                          <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{item.quantity}× {item.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        order.status === 'pending' ? 'bg-warning text-warning-foreground' :
                        order.status === 'cooking' ? 'bg-primary text-primary-foreground' :
                        'bg-success text-success-foreground'
                      }>
                        {order.status.toUpperCase()}
                      </Badge>
                      {order.status === 'pending' && (
                        <Button onClick={() => updateOrderStatus(order.id, 'cooking')} className="bg-primary text-primary-foreground font-heading font-bold h-12">
                          Start Cooking
                        </Button>
                      )}
                      {order.status === 'cooking' && (
                        deliverOrderId === order.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={otpInput}
                              onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="Enter OTP"
                              className="w-28 h-12 text-lg text-center tracking-widest"
                            />
                            <Button onClick={() => confirmOtp(order)} className="bg-success text-success-foreground font-heading font-bold h-12">
                              Verify
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => handleDeliver(order)} className="bg-success text-success-foreground font-heading font-bold h-12 text-base">
                            ✓ Mark as Delivered
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-12">No orders yet</p>}
            </div>
          </div>
        )}

        {tab === 'restock' && (
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Station Supply & Restock</h1>
            <p className="text-muted-foreground text-sm mb-6">Enter a train number or PNR to find the route, then request supplies from upcoming stations.</p>

            {/* Train Search */}
            {!selectedRoute && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Train className="h-5 w-5 text-primary" />
                  <h2 className="font-heading font-semibold text-card-foreground">Find Train Route</h2>
                </div>
                <div className="flex gap-3">
                  <Input
                    value={trainInput}
                    onChange={e => void handleTrainInputChange(e.target.value)}
                    placeholder="Enter Train No. (e.g. 12301) or 10-digit PNR"
                    className="flex-1"
                  />
                  <Button onClick={handleSearchTrain} className="bg-primary text-primary-foreground font-heading font-bold">
                    Search
                  </Button>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Popular trains:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTrains.map(r => (
                      <button
                        key={r.trainNumber}
                        onClick={() => { setSelectedRoute(r); setCurrentStationIdx(0); }}
                        className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        {r.trainNumber} – {r.trainName.substring(0, 20)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Route Display */}
            {selectedRoute && !restockStation && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Button variant="outline" onClick={() => { setSelectedRoute(null); setTrainInput(''); }}>← Back</Button>
                  <div>
                    <h2 className="font-heading font-bold text-foreground text-lg">{selectedRoute.trainName}</h2>
                    <p className="text-xs text-muted-foreground">Train #{selectedRoute.trainNumber}</p>
                  </div>
                </div>

                {/* Current Station Selector */}
                <div className="bg-card border border-border rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Select current station (where the train is now):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.stations.map((station, idx) => (
                      <button
                        key={station}
                        onClick={() => setCurrentStationIdx(idx)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentStationIdx === idx
                            ? 'bg-primary text-primary-foreground'
                            : idx < currentStationIdx
                            ? 'bg-muted text-muted-foreground line-through'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route Visualization */}
                <div className="bg-card border border-border rounded-xl p-4 mb-6">
                  <p className="text-sm font-heading font-semibold text-card-foreground mb-3">Route Map</p>
                  <div className="flex items-center overflow-x-auto gap-1 pb-2">
                    {selectedRoute.stations.map((station, idx) => (
                      <div key={station} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            idx < currentStationIdx ? 'bg-muted border-muted-foreground' :
                            idx === currentStationIdx ? 'bg-primary border-primary animate-pulse' :
                            'bg-secondary border-border'
                          }`} />
                          <span className={`text-[10px] mt-1 max-w-[60px] text-center leading-tight ${
                            idx === currentStationIdx ? 'text-primary font-bold' : 'text-muted-foreground'
                          }`}>{station}</span>
                        </div>
                        {idx < selectedRoute.stations.length - 1 && (
                          <div className={`w-8 h-0.5 ${idx < currentStationIdx ? 'bg-muted-foreground' : 'bg-border'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Stations to Restock */}
                <h3 className="font-heading font-semibold text-foreground mb-3">Upcoming Stations</h3>
                {nextStations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No upcoming stations. This is the last stop.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nextStations.map((station, i) => (
                      <button
                        key={station}
                        onClick={() => setRestockStation(station)}
                        className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary transition-colors"
                      >
                        <Truck className="h-8 w-8 text-primary mb-3" />
                        <h3 className="font-heading font-bold text-card-foreground text-lg">{station}</h3>
                        <p className="text-sm text-muted-foreground">Base Kitchen Hub · Stop #{currentStationIdx + i + 2}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Restock Form */}
            {selectedRoute && restockStation && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="outline" onClick={() => setRestockStation(null)}>← Back</Button>
                  <h2 className="font-heading font-bold text-foreground text-xl">Restock from {restockStation}</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-card-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Current: {item.stock_quantity} units</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRestockItems(prev => ({ 
                            ...prev, 
                            [item.id]: Math.max(0, (prev[item.id] || 0) - 1) 
                          }))}
                          className="h-10 w-10 p-0 font-bold"
                        >−</Button>
                        <Input
                          type="number"
                          min={0}
                          value={restockItems[item.id] || 0}
                          onChange={e => setRestockItems(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="w-20 h-10 text-center font-heading font-bold text-lg number-input"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRestockItems(prev => ({ 
                            ...prev, 
                            [item.id]: (prev[item.id] || 0) + 1 
                          }))}
                          className="h-10 w-10 p-0 font-bold"
                        >+</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleRestock} className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-bold text-lg rounded-xl">
                  <RefreshCw className="mr-2 h-5 w-5" /> Confirm Restock from {restockStation}
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'tracking' && (
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Restock Tracking & Updates</h1>
            <p className="text-muted-foreground text-sm mb-6">Monitor all active restock requests and track train progress to restocking stations.</p>

            {activeRestocks.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Train className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No active restock requests</p>
                <p className="text-sm text-muted-foreground mt-1">Create a restock request from the Station Restock tab to begin tracking.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeRestocks.map(restock => {
                  const { stopsAway, estimatedTime } = calculateStopsAwayAndTime(restock, currentStationIdx);
                  const progressPercent = ((restock.trainRoute.stations.length - restock.stationIndex + currentStationIdx) / restock.trainRoute.stations.length) * 100;
                  const currentStation = restock.trainRoute.stations[currentStationIdx];
                  
                  return (
                    <div key={restock.id} className="glass-card tracking-card rounded-2xl p-6 border border-white/20">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                          <h2 className="font-heading font-bold text-foreground text-xl mb-1">{restock.trainRoute.trainName}</h2>
                          <p className="text-sm text-muted-foreground">Train #{restock.trainRoute.trainNumber}</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary border border-primary/40">
                          {stopsAway} stops away
                        </Badge>
                      </div>

                      {/* Current Status */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-slate-950/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                          <p className="font-heading font-semibold text-card-foreground">{currentStation}</p>
                        </div>
                        <div className="bg-slate-950/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Destination</p>
                          <p className="font-heading font-semibold text-primary">{restock.station}</p>
                        </div>
                        <div className="bg-slate-950/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">ETA</p>
                          <p className="font-heading font-semibold text-card-foreground">{estimatedTime}</p>
                        </div>
                        <div className="bg-slate-950/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Stop Distance</p>
                          <p className="font-heading font-semibold text-accent">After {stopsAway} stop{stopsAway !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-foreground">Journey Progress</p>
                          <p className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</p>
                        </div>
                        <div className="h-3 bg-slate-950/20 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full progress-bar-gradient rounded-full transition-all duration-500 shadow-lg shadow-primary/50"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Station Route Visualization */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-foreground mb-3">Route Stations</p>
                        <div className="flex items-center overflow-x-auto gap-1 pb-2">
                          {restock.trainRoute.stations.map((station, idx) => {
                            const isPassed = idx < currentStationIdx;
                            const isCurrent = idx === currentStationIdx;
                            const isTarget = idx === restock.stationIndex;
                            
                            return (
                              <div key={station} className="flex items-center shrink-0">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                    isPassed ? 'bg-muted border-muted-foreground' :
                                    isCurrent ? 'bg-primary border-primary animate-pulse shadow-lg shadow-primary/50' :
                                    isTarget ? 'bg-accent border-accent shadow-lg shadow-accent/50' :
                                    'bg-secondary border-border'
                                  }`} />
                                  <span className={`text-[9px] mt-1.5 max-w-[50px] text-center leading-tight font-medium ${
                                    isCurrent ? 'text-primary font-bold' :
                                    isTarget ? 'text-accent font-bold' :
                                    isPassed ? 'text-muted-foreground line-through' :
                                    'text-muted-foreground'
                                  }`}>{station}</span>
                                </div>
                                {idx < restock.trainRoute.stations.length - 1 && (
                                  <div className={`w-6 h-0.5 ${isPassed || isCurrent ? 'bg-primary/50' : 'bg-border'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items Being Restocked */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-foreground mb-3">Items to Restock</p>
                        <div className="bg-slate-950/20 rounded-lg p-4 space-y-2">
                          {Object.entries(restock.items)
                            .filter(([, qty]) => qty > 0)
                            .map(([itemId, qty]) => {
                              const itemName = items.find(i => i.id === itemId)?.name || itemId;
                              return (
                                <div key={itemId} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{itemName}</span>
                                  <span className="font-semibold text-foreground">{qty} units</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStationIdx(Math.min(currentStationIdx + 1, restock.trainRoute.stations.length - 1))}
                          className="flex-1"
                        >
                          <Train className="mr-2 h-4 w-4" /> Next Station
                        </Button>
                        <Button
                          onClick={() => handleCompleteRestock(restock.id)}
                          disabled={stopsAway > 0}
                          className={`flex-1 font-heading font-bold ${
                            stopsAway <= 0
                              ? 'bg-success text-success-foreground hover:bg-success/90'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          {stopsAway > 0 ? '⏱️ Awaiting Arrival' : '✓ Complete Restock'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-heading font-bold ${
        accent === 'warning' ? 'text-warning' :
        accent === 'destructive' ? 'text-destructive' :
        accent === 'success' ? 'text-success' :
        'text-card-foreground'
      }`}>{value}</p>
    </div>
  );
}
