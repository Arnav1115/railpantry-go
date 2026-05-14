import { useState } from 'react';
import { Package, ClipboardList, Truck, Train, AlertTriangle, RefreshCw, LogOut, ShieldCheck, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { NightOwlBanner } from '@/components/NightOwlBanner';
import { trainRoutes, findTrainByPnr, type TrainRoute } from '@/lib/trainRoutes';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { Order } from '@/lib/types';

type Tab = 'inventory' | 'orders' | 'restock';

interface VendorUser {
  username: string;
  coaches: string[] | 'ALL';
}

const VENDOR_ACCOUNTS: Record<string, { password: string; coaches: string[] | 'ALL' }> = {
  'ADMIN': { password: 'ADMIN', coaches: 'ALL' },
  'B4VENDOR': { password: '4VENDOR', coaches: ['B4'] },
  'B1VENDOR': { password: '1VENDOR', coaches: ['B1'] },
  'B2VENDOR': { password: '2VENDOR', coaches: ['B2'] },
  'B3VENDOR': { password: '3VENDOR', coaches: ['B3'] },
};

export default function AdminDashboard() {
  useOnlineStatus();
  const { items, loading: invLoading, updateStock } = useInventory();
  const { orders, loading: ordLoading, updateOrderStatus } = useOrders();
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<VendorUser | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [tab, setTab] = useState<Tab>('orders');
  const [otpInput, setOtpInput] = useState('');
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);

  // Restock state
  const [trainInput, setTrainInput] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<TrainRoute | null>(null);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [restockStation, setRestockStation] = useState<string | null>(null);
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim().toUpperCase();
    const account = VENDOR_ACCOUNTS[cleanUsername];

    if (account && account.password === passwordInput) {
      setCurrentUser({ username: cleanUsername, coaches: account.coaches });
      toast.success(`Logged in as ${cleanUsername}`);
    } else {
      toast.error('Invalid Vendor ID or Password');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput('');
    setPasswordInput('');
    toast.info('Logged out successfully');
  };

  const handleDeliver = (order: Order) => {
    setDeliverOrderId(order.id);
    setOtpInput('');
  };

  const confirmOtp = (order: Order) => {
    if (otpInput === order.otp) {
      updateOrderStatus(order.id, 'delivered');
      setDeliverOrderId(null);
      toast.success('Order delivered successfully!');
    } else {
      toast.error('Invalid Delivery PIN');
    }
  };

  const handleSearchTrain = () => {
    const route = trainRoutes.find(r => r.trainNumber === trainInput.trim()) || findTrainByPnr(trainInput.trim());
    if (route) {
      setSelectedRoute(route);
      setCurrentStationIdx(0);
      toast.success(`Found: ${route.trainName}`);
    } else {
      toast.error('Train not found.');
    }
  };

  const handleRestock = async () => {
    for (const [id, qty] of Object.entries(restockItems)) {
      if (qty > 0) {
        const item = items.find(i => i.id === id);
        if (item) await updateStock(id, item.stock_quantity + qty);
      }
    }
    toast.success(`Restock request sent to ${restockStation}!`);
    setRestockStation(null);
    setRestockItems({});
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 font-sans text-white">
        <div className="w-full max-w-md bg-neutral-800 p-8 rounded-3xl shadow-2xl border border-neutral-700 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-4">Authorized Vendor Access</h1>
            <p className="text-sm text-neutral-400">Please log in to view assigned coach orders.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Vendor ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="e.g. B4VENDOR"
                  className="h-14 pl-12 bg-neutral-900 border-neutral-700 text-white rounded-xl focus-visible:ring-orange-500 uppercase tracking-wide"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="e.g. 4VENDOR"
                  className="h-14 pl-12 bg-neutral-900 border-neutral-700 text-white rounded-xl focus-visible:ring-orange-500 tracking-wide"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
              Login to Vendor Portal
            </Button>
          </form>

          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-700/50 text-xs text-neutral-400 space-y-1">
            <p className="font-bold text-neutral-300">Coach Assignments:</p>
            <p>• <span className="font-semibold text-orange-400">B4VENDOR</span> (Pwd: <span className="text-orange-400">4VENDOR</span>) - Coach B4 only</p>
            <p>• <span className="font-semibold text-orange-400">B1VENDOR</span> (Pwd: <span className="text-orange-400">1VENDOR</span>) - Coach B1 only</p>
            <p>• <span className="font-semibold text-orange-400">ADMIN</span> (Pwd: <span className="text-orange-400">ADMIN</span>) - Full Master Access</p>
          </div>

          <Link to="/" className="block text-center text-sm font-medium text-neutral-400 hover:text-white">
            ← Back to Passenger Website
          </Link>
        </div>
      </div>
    );
  }

  const sideItems = [
    { id: 'orders' as Tab, label: 'Coach Orders', icon: ClipboardList },
    { id: 'inventory' as Tab, label: 'Pantry Stock', icon: Package },
    { id: 'restock' as Tab, label: 'Station Restock', icon: Truck },
  ];

  // Filter orders based on assigned coaches
  const visibleOrders = orders.filter(o => {
    if (currentUser.coaches === 'ALL') return true;
    return currentUser.coaches.some(coach => o.coach_seat.toUpperCase().includes(coach.toUpperCase()));
  });

  const pendingOrders = visibleOrders.filter(o => o.status !== 'delivered');
  const nextStations = selectedRoute ? selectedRoute.stations.slice(currentStationIdx + 1) : [];

  return (
    <div className="min-h-screen bg-neutral-950 flex text-neutral-100 font-sans selection:bg-orange-500/30">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-5 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white leading-none">RailPantry</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase">{currentUser.username}</span>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {sideItems.map(s => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === s.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <s.icon className="h-5 w-5" />
              {s.label}
              {s.id === 'orders' && pendingOrders.length > 0 && (
                <Badge className="ml-auto bg-white text-orange-600 font-extrabold text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</Badge>
              )}
            </button>
          ))}
        </nav>

        <Button onClick={handleLogout} variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl py-6 font-bold">
          <LogOut className="mr-2 h-5 w-5" /> Exit Vendor Portal
        </Button>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 flex z-30 pb-safe">
        {sideItems.map(s => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold ${
              tab === s.id ? 'text-orange-500' : 'text-neutral-400'
            }`}
          >
            <s.icon className="h-5 w-5" />
            {s.label.split(' ')[0]}
          </button>
        ))}
        <button onClick={handleLogout} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold text-neutral-400">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 lg:p-8 pb-32 lg:pb-8 overflow-auto max-w-7xl mx-auto">
        
        {/* Active Coach Assignment Badge */}
        <div className="mb-6 flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Assigned Coaches</p>
            <h2 className="font-extrabold text-xl text-white">
              {currentUser.coaches === 'ALL' ? 'Master Access (All Coaches)' : `Coaches: ${currentUser.coaches.join(', ')}`}
            </h2>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-3 py-1 rounded-full font-bold">
            Live Feed
          </Badge>
        </div>

        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Order Queue</h1>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="h-9 px-4 bg-neutral-900 border-neutral-800 text-neutral-300 font-bold hover:bg-neutral-800">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Assigned Pending" value={pendingOrders.length} />
              <StatCard label="Delivered Today" value={visibleOrders.filter(o => o.status === 'delivered').length} accent="success" />
            </div>

            <div className="space-y-4">
              {visibleOrders.map(order => (
                <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-500/20 text-orange-400 font-bold text-xs px-3 py-1 rounded-full border border-orange-500/30">
                        {order.coach_seat}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">PNR: {order.pnr_number}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap pt-1">
                      {(order.items as any[]).map((item: any, i: number) => (
                        <span key={i} className="text-sm bg-neutral-800 text-neutral-200 px-3 py-1 rounded-xl font-semibold border border-neutral-700">
                          {item.quantity}× {item.name}
                        </span>
                      ))}
                    </div>

                    <p className="font-extrabold text-lg text-white pt-1">₹{order.total_price}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Badge className={`px-4 py-1.5 rounded-xl font-bold text-xs ${
                      order.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      order.status === 'cooking' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {order.status.toUpperCase()}
                    </Badge>

                    {order.status === 'pending' && (
                      <Button onClick={() => updateOrderStatus(order.id, 'cooking')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                        Start Cooking
                      </Button>
                    )}

                    {order.status === 'cooking' && (
                      deliverOrderId === order.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            value={otpInput}
                            onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="PIN"
                            className="w-20 h-12 text-center tracking-widest bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 font-extrabold rounded-xl focus-visible:ring-orange-500"
                            maxLength={4}
                            autoFocus
                          />
                          <Button onClick={() => confirmOtp(order)} className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                            Verify PIN
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleDeliver(order)} className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                          ✓ Deliver
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}

              {visibleOrders.length === 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
                  <ClipboardList className="w-12 h-12 text-neutral-600 mx-auto" />
                  <p className="text-neutral-400 font-bold">No active orders found for assigned coaches.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Pantry Inventory</h1>
            <p className="text-neutral-400 text-sm mb-6">Manage stock levels across the pantry network.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total SKUs" value={items.length} />
              <StatCard label="Low Stock Items" value={items.filter(i => i.stock_quantity > 0 && i.stock_quantity <= i.threshold).length} accent="warning" />
              <StatCard label="Out of Stock" value={items.filter(i => i.stock_quantity === 0).length} accent="destructive" />
              <StatCard label="Total Value" value={`₹${items.reduce((s, i) => s + i.price * i.stock_quantity, 0).toLocaleString()}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => {
                const outOfStock = item.stock_quantity === 0;
                const lowStock = item.stock_quantity > 0 && item.stock_quantity <= item.threshold;
                return (
                  <div
                    key={item.id}
                    className={`bg-neutral-900 border rounded-3xl p-5 transition-all ${
                      outOfStock
                        ? 'border-red-500/50 bg-red-500/5'
                        : lowStock
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white text-base">{item.name}</h3>
                        <p className="text-xs text-neutral-400">{item.category}</p>
                      </div>
                      {outOfStock && <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">OUT</Badge>}
                      {lowStock && <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">LOW</Badge>}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-extrabold text-white leading-none mb-1">{item.stock_quantity}</p>
                        <p className="text-xs text-neutral-400">₹{item.price} / unit</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStock(item.id, Math.max(0, item.stock_quantity - 1))}
                          className="h-10 w-10 p-0 rounded-xl bg-neutral-800 border-neutral-700 text-white font-bold"
                        >-</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStock(item.id, item.stock_quantity + 1)}
                          className="h-10 w-10 p-0 rounded-xl bg-neutral-800 border-neutral-700 text-white font-bold"
                        >+</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'restock' && (
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Station Supply Restock</h1>
            <p className="text-neutral-400 text-sm mb-6">Request fresh stock from upcoming base stations along the route.</p>

            {!selectedRoute && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Train className="h-5 w-5 text-orange-500" />
                  <h2 className="font-bold text-white">Find Train Route</h2>
                </div>
                <div className="flex gap-3">
                  <Input
                    value={trainInput}
                    onChange={e => setTrainInput(e.target.value)}
                    placeholder="Enter Train No. (e.g. 12301) or PNR"
                    className="flex-1 h-12 bg-neutral-800 border-neutral-700 text-white rounded-xl focus-visible:ring-orange-500"
                  />
                  <Button onClick={handleSearchTrain} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                    Search
                  </Button>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-neutral-400 mb-2 font-bold uppercase tracking-wider">Quick Select Routes:</p>
                  <div className="flex flex-wrap gap-2">
                    {trainRoutes.map(r => (
                      <button
                        key={r.trainNumber}
                        onClick={() => { setSelectedRoute(r); setCurrentStationIdx(0); }}
                        className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-2 rounded-xl hover:bg-neutral-700 hover:text-white font-bold transition-all"
                      >
                        {r.trainNumber} – {r.trainName.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedRoute && !restockStation && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => { setSelectedRoute(null); setTrainInput(''); }} className="bg-neutral-900 border-neutral-800 text-neutral-300 rounded-xl font-bold">← Back</Button>
                  <div>
                    <h2 className="font-extrabold text-white text-lg">{selectedRoute.trainName}</h2>
                    <p className="text-xs text-neutral-400 font-bold">Train #{selectedRoute.trainNumber}</p>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Select Current Train Location</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.stations.map((station, idx) => (
                      <button
                        key={station}
                        onClick={() => setCurrentStationIdx(idx)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          currentStationIdx === idx
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : idx < currentStationIdx
                            ? 'bg-neutral-800/50 text-neutral-600 line-through border border-neutral-800'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                        }`}
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                </div>

                <h3 className="font-extrabold text-white tracking-tight">Upcoming Restock Hubs</h3>
                {nextStations.length === 0 ? (
                  <p className="text-neutral-500 text-sm font-bold">No upcoming stations. Train is reaching destination.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nextStations.map((station, i) => (
                      <button
                        key={station}
                        onClick={() => setRestockStation(station)}
                        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left hover:border-orange-500 transition-all group"
                      >
                        <Truck className="h-8 w-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-extrabold text-white text-lg mb-1">{station}</h3>
                        <p className="text-xs text-neutral-400 font-medium">FSSAI Base Kitchen · Stop #{currentStationIdx + i + 2}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedRoute && restockStation && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setRestockStation(null)} className="bg-neutral-900 border-neutral-800 text-neutral-300 rounded-xl font-bold">← Back</Button>
                  <h2 className="font-extrabold text-white text-xl">Restock from {restockStation}</h2>
                </div>

                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 px-5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-base mb-0.5">{item.name}</p>
                        <p className="text-xs text-neutral-400 font-medium">Current Stock: {item.stock_quantity} units</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        value={restockItems[item.id] || ''}
                        onChange={e => setRestockItems(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                        placeholder="Qty"
                        className="w-24 h-12 text-center bg-neutral-800 border-neutral-700 text-white rounded-xl font-bold focus-visible:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleRestock} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                  <RefreshCw className="mr-2 h-5 w-5" /> Confirm Restock Request
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-extrabold leading-none ${
        accent === 'warning' ? 'text-amber-400' :
        accent === 'destructive' ? 'text-red-400' :
        accent === 'success' ? 'text-green-400' :
        'text-white'
      }`}>{value}</p>
    </div>
  );
}
