import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bot, Send, ShoppingCart, Sparkles, Cloud, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import type { CartItem } from '@/lib/types';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, ChatSession } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

interface AgenticAIProps {
  onCheckout: (cart: CartItem[]) => void;
  onBack: () => void;
}

type Message = {
  role: 'user' | 'model';
  text: string;
};

const addToCartTool: FunctionDeclaration = {
  name: 'add_to_cart',
  description: 'Adds specified food or beverage items to the passenger cart. Only use this if the item is available in the inventory. Provide the item id.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            itemId: { type: SchemaType.STRING, description: 'The unique ID of the item to add' },
            quantity: { type: SchemaType.INTEGER, description: 'The quantity to add' }
          },
          required: ['itemId', 'quantity']
        }
      }
    },
    required: ['items']
  }
};

const suggestedPrompts = [
  "Suggest a light meal for my night journey",
  "What's hot and popular right now?",
  "I have a sore throat, any hot beverages?"
];

export function AgenticAI({ onCheckout, onBack }: AgenticAIProps) {
  const { items: inventoryItems, loading } = useInventory();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi Arjun! I am your AI Meal Assistant. I noticed you are traveling to New Delhi and the weather is a bit chilly. How can I make your journey more comfortable today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!loading && inventoryItems.length > 0 && !chatSessionRef.current) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages([{ role: 'model', text: 'Configuration error: Gemini API key is missing.' }]);
        return;
      }
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are an empathetic, premium AI Meal Assistant for RailPantry. 
          You assist passengers in ordering food.
          The passenger is Arjun, traveling to New Delhi. Current time is evening, weather is chilly.
          
Current Inventory:
${inventoryItems.map(i => `${i.id} - ${i.name} - ₹${i.price} - ${i.stock_quantity} left`).join('\n')}

Use add_to_cart tool to add items if they express intent to buy. Be extremely polite, concise, and helpful. Focus on emotional comfort and safe, hygienic food.`,
          tools: [{ functionDeclarations: [addToCartTool] }]
        });
        chatSessionRef.current = model.startChat({ history: [] });
      } catch (err) {
        setMessages([{ role: 'model', text: 'Failed to connect to the AI service.' }]);
      }
    }
  }, [inventoryItems, loading]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input.trim();
    if (!textToSend || !chatSessionRef.current) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      let result = await chatSessionRef.current.sendMessage(textToSend);
      
      const calls = result.response.functionCalls();
      if (calls && calls.length > 0) {
        for (const call of calls) {
          if (call.name === 'add_to_cart') {
            const args = call.args as any;
            let addedNames: string[] = [];
            
            setCart(prevCart => {
              let newCart = [...prevCart];
              for (const toAdd of args.items) {
                const invItem = inventoryItems.find(i => i.id === toAdd.itemId);
                if (invItem && invItem.stock_quantity > 0) {
                  addedNames.push(`${toAdd.quantity}x ${invItem.name}`);
                  const existing = newCart.find(c => c.id === invItem.id);
                  if (existing) existing.quantity += toAdd.quantity;
                  else newCart.push({ ...invItem, quantity: toAdd.quantity });
                }
              }
              return newCart;
            });

            result = await chatSessionRef.current.sendMessage([{
              functionResponse: {
                name: 'add_to_cart',
                response: { status: 'success', added: addedNames }
              }
            }]);
          }
        }
      }
      setMessages(prev => [...prev, { role: 'model', text: result.response.text() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="min-h-[100dvh] bg-neutral-50 flex flex-col font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 pt-safe pb-4 px-4 shadow-md text-white rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-200" />
            <div>
              <h1 className="font-extrabold text-lg leading-tight">AI Assistant</h1>
              <p className="text-purple-200 text-xs font-medium">Smart Journey Recommendations</p>
            </div>
          </div>
        </div>
        
        {/* Context Banner */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
            <Cloud className="w-3.5 h-3.5 text-blue-200" />
            <span className="text-xs font-medium">Chilly Evening</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-orange-200" />
            <span className="text-xs font-medium">Dinner Time</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-green-200" />
            <span className="text-xs font-medium">FSSAI Safe</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        <AnimatePresence>
          {messages.map((m, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white border border-neutral-100 text-neutral-800 rounded-tl-sm'}`}>
                {m.role === 'model' ? (
                  <div className="prose prose-sm prose-neutral max-w-none leading-relaxed font-medium">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm font-medium">{m.text}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-neutral-100 text-neutral-800 rounded-3xl rounded-tl-sm p-4 shadow-sm max-w-[85%]">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 pb-safe z-50">
        
        {messages.length === 1 && !isTyping && (
          <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestedPrompts.map((p, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(p)}
                className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-transform shrink-0"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {cartCount > 0 && (
          <div className="px-4 pt-3">
            <div className="bg-neutral-900 rounded-2xl p-3 px-5 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-white font-bold text-sm">{cartCount} items selected</p>
                <p className="text-neutral-400 text-xs font-medium">₹{cartTotal}</p>
              </div>
              <Button onClick={() => onCheckout(cart)} className="h-9 px-4 bg-white text-neutral-900 rounded-xl font-bold text-sm">
                Checkout
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 flex gap-2">
          <div className="flex-1 bg-neutral-100 rounded-full flex items-center px-4 border border-neutral-200 focus-within:border-purple-400 focus-within:bg-white transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for recommendations..."
              className="w-full bg-transparent border-none focus:outline-none h-12 text-sm font-medium"
              disabled={isTyping || loading}
            />
          </div>
          <Button 
            onClick={() => handleSend()} 
            disabled={isTyping || loading || !input.trim()} 
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-lg shadow-purple-600/30"
          >
            <Send className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
