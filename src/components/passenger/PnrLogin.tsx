import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, ArrowRight, User, Search, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PnrLoginProps {
  onLogin: (pnr: string, seat: string) => void;
}

export function PnrLogin({ onLogin }: PnrLoginProps) {
  const [pnr, setPnr] = useState('');
  const [seat, setSeat] = useState('');
  const [step, setStep] = useState<'pnr' | 'loading' | 'details' | 'seat'>('pnr');
  const [trainDetails, setTrainDetails] = useState<any>(null);

  const isValidPnr = /^\d{10}$/.test(pnr);
  const isValidSeat = seat.trim().length > 0;

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPnr) return;
    
    setStep('loading');
    
    // Mock API Call
    setTimeout(() => {
      setTrainDetails({
        trainName: 'Rajdhani Express',
        trainNumber: '12951',
        from: 'Mumbai Central (MMCT)',
        to: 'New Delhi (NDLS)',
        boardingTime: '17:00',
        arrival: '08:32',
        passengerName: 'Arjun K.',
        coach: 'B4'
      });
      setStep('details');
    }, 2000);
  };

  const confirmDetails = () => {
    setStep('seat');
  };

  const finalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSeat) return;
    onLogin(pnr, seat);
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 flex flex-col items-center pt-12 p-6 font-sans">
      <div className="w-full max-w-md space-y-8 relative">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="mx-auto w-16 h-16 bg-white shadow-xl shadow-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-100"
          >
            <Train className="h-8 w-8 text-orange-500" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-4">Journey Details</h1>
          <p className="text-neutral-500 text-sm">We'll fetch your route to find the best food.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden relative min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PNR */}
            {step === 'pnr' && (
              <motion.form 
                key="pnr"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePnrSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Enter 10-Digit PNR</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                      value={pnr}
                      onChange={e => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 1234567890"
                      className="h-14 pl-12 bg-neutral-50 border-neutral-200 text-lg tracking-widest focus-visible:ring-orange-500 rounded-xl"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!isValidPnr}
                  className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Find My Train <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.form>
            )}

            {/* STEP 2: LOADING */}
            {step === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full py-8 space-y-6"
              >
                <div className="relative w-16 h-16">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-neutral-100 border-t-orange-500 rounded-full"
                  />
                  <Train className="absolute inset-0 m-auto w-6 h-6 text-orange-500" />
                </div>
                <div className="space-y-2 text-center w-full">
                  <p className="font-semibold text-neutral-700">Connecting to IRCTC...</p>
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }} 
                      animate={{ width: "100%" }} 
                      transition={{ duration: 2 }}
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 'details' && trainDetails && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 leading-none mb-1">Journey Found</h3>
                    <p className="text-xs text-neutral-500">PNR: {pnr}</p>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 space-y-4 border border-neutral-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Train</p>
                      <p className="font-bold text-neutral-800">{trainDetails.trainNumber} - {trainDetails.trainName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between relative pt-2">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-neutral-200 -translate-y-1/2" />
                    <div className="relative z-10 bg-neutral-50 px-2 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mb-1" />
                      <p className="text-xs font-bold text-neutral-700">{trainDetails.boardingTime}</p>
                      <p className="text-[10px] text-neutral-500 truncate w-16 text-center">{trainDetails.from.split(' ')[0]}</p>
                    </div>
                    <div className="relative z-10 bg-neutral-50 px-2 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full border-2 border-neutral-300 bg-white mb-1" />
                      <p className="text-xs font-bold text-neutral-700">{trainDetails.arrival}</p>
                      <p className="text-[10px] text-neutral-500 truncate w-16 text-center">{trainDetails.to.split(' ')[0]}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={confirmDetails}
                  className="w-full h-14 text-lg font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all active:scale-95"
                >
                  Looks Good, Continue
                </Button>
              </motion.div>
            )}

            {/* STEP 4: SEAT */}
            {step === 'seat' && (
              <motion.form 
                key="seat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={finalSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Confirm Coach & Seat</label>
                  <p className="text-xs text-neutral-500 mb-2">We detected Coach <span className="font-bold text-neutral-800">{trainDetails?.coach}</span>. Please enter your seat number for delivery.</p>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                      value={seat}
                      onChange={e => setSeat(e.target.value)}
                      placeholder={`e.g. ${trainDetails?.coach}, Seat 42`}
                      className="h-14 pl-12 bg-neutral-50 border-neutral-200 text-lg focus-visible:ring-orange-500 rounded-xl"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="h-14 px-6 rounded-xl border-neutral-200 text-neutral-600"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValidSeat}
                    className="flex-1 h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    Explore Menu
                  </Button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
