import { useState } from 'react';
import { Package, ClipboardList, Truck, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { NightOwlBanner } from '@/components/NightOwlBanner';
import { toast } from 'sonner';
import type { Order } from '@/lib/types';

type Tab = 'inventory' | 'orders' | 'restock';

const stations = ['Nagpur', 'Bhopal', 'Jhansi', 'Agra', 'New Delhi'];

export default function AdminDashboard() {
  useOnlineStatus();
  const { items, loading: invLoading, updateStock } = useInventory();
  const { orders, loading: ordLoading, updateOrderStatus } = useOrders();
  const [tab, setTab] = useState<Tab>('inventory');
  const [otpInput, setOtpInput] = useState('');
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);
  const [restockStation, setRestockStation] = useState<string | null>(null);
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});

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

  const handleRestock = async () => {
    for (const [id, qty] of Object.entries(restockItems)) {
      if (qty > 0) {
        const item = items.find(i => i.id === id);
        if (item) await updateStock(id, item.stock_quantity + qty);
      }
    }
    toast.success(`Restock from ${restockStation} completed!`);
    setRestockStation(null);
    setRestockItems({});
  };

  const sideItems = [
    { id: 'inventory' as Tab, label: 'Main Inventory', icon: Package },
    { id: 'orders' as Tab, label: 'Order Queue', icon: ClipboardList },
    { id: 'restock' as Tab, label: 'Station Restock', icon: Truck },
  ];

  const pendingOrders = orders.filter(o => o.status !== 'delivered');

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-card-foreground text-lg">RailPantry</span>
        </div>
        <nav className="space-y-1">
          {sideItems.map(s => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
              {s.id === 'orders' && pendingOrders.length > 0 && (
                <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs">{pendingOrders.length}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-20">
        {sideItems.map(s => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
              tab === s.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <s.icon className="h-5 w-5" />
            {s.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
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
                    className={`bg-card border rounded-xl p-5 transition-all ${
                      outOfStock
                        ? 'border-destructive bg-destructive/10 pulse-red'
                        : lowStock
                        ? 'border-warning bg-warning/5'
                        : 'border-border'
                    }`}
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
            <p className="text-muted-foreground text-sm mb-6">Request items from the next station's base kitchen.</p>

            {!restockStation ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map(station => (
                  <button
                    key={station}
                    onClick={() => setRestockStation(station)}
                    className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary transition-colors"
                  >
                    <Truck className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-heading font-bold text-card-foreground text-lg">{station}</h3>
                    <p className="text-sm text-muted-foreground">Base Kitchen Hub</p>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="outline" onClick={() => setRestockStation(null)}>← Back</Button>
                  <h2 className="font-heading font-bold text-foreground text-xl">Restock from {restockStation}</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-heading font-semibold text-card-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Current: {item.stock_quantity} units</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        value={restockItems[item.id] || ''}
                        onChange={e => setRestockItems(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                        placeholder="Qty"
                        className="w-24 h-10 text-center"
                      />
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
