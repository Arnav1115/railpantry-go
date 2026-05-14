import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bot, Send, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import type { CartItem, InventoryItem } from '@/lib/types';
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

export function AgenticAI({ onCheckout, onBack }: AgenticAIProps) {
  const { items: inventoryItems, loading } = useInventory();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am your AI RailServe Assistant. I can help you find items on the menu or place an order for you. What would you like?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!loading && inventoryItems.length > 0 && !chatSessionRef.current) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages([{ role: 'model', text: 'Configuration error: Gemini API key is missing. Please add it to Vercel Environment Variables and redeploy.' }]);
        return;
      }
      
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are a helpful assistant for RailPantry. You assist train passengers in ordering food and drinks. Be friendly and concise.
          
Current Inventory available (ID - Name - Price - Stock):
${inventoryItems.map(i => `${i.id} - ${i.name} - ₹${i.price} - ${i.stock_quantity} left`).join('\n')}

If a user asks for something we have, use the add_to_cart tool to add it if they express intent to buy. If they just ask what's available, list some relevant items. If they ask for something not in inventory, apologize and say we don't have it.
Do NOT use the tool if the item is out of stock (0 left).
`,
          tools: [{ functionDeclarations: [addToCartTool] }]
        });

        chatSessionRef.current = model.startChat({
          history: [],
        });
      } catch (err) {
        console.error("Failed to initialize Gemini:", err);
        setMessages([{ role: 'model', text: 'Failed to connect to the AI service. Please check your API key.' }]);
      }
    }
  }, [inventoryItems, loading]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      let result = await chatSessionRef.current.sendMessage(userText);
      
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
                  if (existing) {
                    existing.quantity += toAdd.quantity;
                  } else {
                    newCart.push({ ...invItem, quantity: toAdd.quantity });
                  }
                }
              }
              return newCart;
            });

            // Send tool response back to the model
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
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[80px]">
      <div className="sticky top-0 z-10 bg-primary p-4 flex items-center gap-3">
        <button onClick={onBack}><ArrowLeft className="h-5 w-5 text-primary-foreground" /></button>
        <Bot className="h-5 w-5 text-primary-foreground" />
        <div className="flex-1">
          <h1 className="font-heading font-bold text-primary-foreground text-lg">AI Assistant</h1>
          <p className="text-primary-foreground/80 text-xs">I can order items for you!</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
              {m.role === 'model' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{m.text}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl rounded-bl-none p-3 max-w-[80%]">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        {cartCount > 0 && (
          <div className="mb-3 flex items-center justify-between bg-secondary p-3 rounded-lg">
            <span className="text-secondary-foreground font-heading font-semibold text-sm">
              {cartCount} items (₹{cartTotal}) ready in cart
            </span>
            <Button onClick={() => onCheckout(cart)} size="sm" className="h-8">
              Checkout <ShoppingCart className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="E.g. I want to order 2 biryanis"
            className="flex-1 rounded-full bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isTyping || loading}
          />
          <Button onClick={handleSend} disabled={isTyping || loading || !input.trim()} size="icon" className="rounded-full shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
