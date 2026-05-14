import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Shield, ArrowRight, Train, CheckCircle2, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const floatingFoods = [
  { id: 1, name: 'Hot Thali', img: '/assets/thali-BQJ0xgYq.jpg', delay: 0, x: -100, y: -50 },
  { id: 2, name: 'Biryani', img: '/assets/biryani-DwVgQoj0.jpg', delay: 1, x: 100, y: -80 },
  { id: 3, name: 'Samosa', img: '/assets/samosa-C3Vgml2P.jpg', delay: 2, x: 80, y: 50 },
  { id: 4, name: 'Masala Chai', img: '/assets/chai-BWNtRVOI.jpg', delay: 1.5, x: -80, y: 80 },
];

const trustBadges = [
  { icon: Shield, label: 'FSSAI Verified' },
  { icon: MapPin, label: 'Live Tracking' },
  { icon: Clock, label: 'On-Time Delivery' },
  { icon: CheckCircle2, label: 'Trusted Vendors' },
];

export default function Index() {
  const [pnr, setPnr] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnr.length >= 10) {
      navigate('/passenger');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 overflow-x-hidden selection:bg-orange-200">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Train className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neutral-800">RailPantry</span>
          </div>
          <Link to="/admin">
            <Button variant="ghost" className="font-medium text-neutral-600 hover:text-orange-500 hover:bg-orange-50">
              Vendor Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden flex flex-col items-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/50 via-neutral-50 to-neutral-50"></div>
        <motion.div 
          animate={{ x: ["-10%", "100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -z-10 opacity-5"
        >
          <Train className="w-96 h-96" />
        </motion.div>

        {/* Floating Food Cards (Desktop) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
          {floatingFoods.map((food) => (
            <motion.div
              key={food.id}
              className="absolute top-1/2 left-1/2 flex flex-col items-center gap-2"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: food.x * 3, 
                y: food.y * 2,
                opacity: 1,
                yoyo: Infinity
              }}
              transition={{ 
                type: "spring",
                stiffness: 50,
                delay: food.delay,
              }}
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: food.delay }}
                className="bg-white p-2 rounded-2xl shadow-xl shadow-orange-900/5 border border-orange-50"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-orange-100 flex items-center justify-center">
                  <Utensils className="text-orange-300 w-8 h-8" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
              Fresh food delivered <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                directly to your seat.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Enjoy your journey with comforting meals. Simply enter your PNR, track live, and receive hot food at upcoming stations.
            </p>

            {/* Smart PNR Form */}
            <form onSubmit={handlePnrSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-orange-900/5 border border-neutral-100 transition-shadow focus-within:shadow-orange-500/10 focus-within:border-orange-200">
              <Input 
                type="text" 
                placeholder="Enter 10-digit PNR" 
                className="h-14 border-0 focus-visible:ring-0 text-lg px-6 bg-transparent"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                maxLength={10}
              />
              <Button type="submit" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-md shadow-orange-500/20 w-full sm:w-auto shrink-0">
                Order via PNR <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <p className="mt-4 text-sm text-neutral-400 font-medium flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-green-500" /> 100% Refund Guarantee on missed deliveries
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-y border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustBadges.map((badge, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <badge.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-neutral-700">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Stats */}
      <section className="py-24 bg-neutral-50 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-neutral-900">Trusted by millions of travelers.</h2>
              <p className="text-lg text-neutral-500">We partner with top-rated FSSAI-approved restaurants to ensure your train journey is as delicious as your destination.</p>
              
              <div className="flex gap-4 pt-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex-1">
                  <h4 className="text-3xl font-bold text-orange-500 mb-1">50k+</h4>
                  <p className="text-neutral-500 font-medium text-sm">Meals Delivered</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex-1">
                  <h4 className="text-3xl font-bold text-orange-500 mb-1">99.8%</h4>
                  <p className="text-neutral-500 font-medium text-sm">On-Time Success</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 transform rotate-3 rounded-3xl opacity-20 blur-xl"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-neutral-100 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-neutral-500">AK</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900">Arjun Kumar</h5>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-neutral-600 text-lg italic">"The biryani was piping hot and delivered right to my seat at Bhopal junction. Completely changed my train travel experience!"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-neutral-100 text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Train className="text-orange-500 w-6 h-6" />
            <span className="font-bold text-xl text-neutral-800">RailPantry</span>
          </div>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">Making train travel delicious, safe, and stress-free. Your journey, our responsibility.</p>
          <div className="flex justify-center gap-6 text-sm font-medium text-neutral-500 mb-8">
            <a href="#" className="hover:text-orange-500">About Us</a>
            <a href="#" className="hover:text-orange-500">Refund Policy</a>
            <a href="#" className="hover:text-orange-500">Contact Support</a>
          </div>
          <p className="text-sm text-neutral-400">© 2026 RailPantry Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
