import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, ChatSession } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const restockTool: FunctionDeclaration = {
  name: 'restock_items',
  description: 'Restock one or more items in the inventory. Use this when the admin asks to restock items. Calculates how much to order based on thresholds if the admin just says "restock low items". Provide the itemId and the quantity to ADD.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            itemId: { type: SchemaType.STRING, description: 'The unique ID of the item to restock' },
            addQuantity: { type: SchemaType.INTEGER, description: 'The quantity to add to the current stock' }
          },
          required: ['itemId', 'addQuantity']
        }
      }
    },
    required: ['items']
  }
};

const deliverOrderTool: FunctionDeclaration = {
  name: 'deliver_order',
  description: 'Mark a pending or cooking order as delivered. Provide the exact orderId.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      orderId: { type: SchemaType.STRING, description: 'The unique ID of the order to mark as delivered' }
    },
    required: ['orderId']
  }
};

export function AdminAgenticAI() {
  const { items: inventoryItems, updateStock } = useInventory();
  const { orders, updateOrderStatus } = useOrders();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello Admin! I can analyze your inventory, restock items automatically, or update order statuses. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (inventoryItems.length > 0 && !chatSessionRef.current) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages([{ role: 'model', text: 'Configuration error: Gemini API key is missing. Please add it to Vercel Environment Variables and redeploy.' }]);
        return;
      }
      
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are the RailPantry Admin Assistant ERP Agent. You help manage supply chains and orders.
          
Current Inventory:
${inventoryItems.map(i => `${i.id} - ${i.name} - Stock: ${i.stock_quantity} (Threshold: ${i.threshold})`).join('\n')}

Current Orders (Not Delivered):
${orders.filter(o => o.status !== 'delivered').map(o => `${o.id} - PNR ${o.pnr_number} - Status: ${o.status}`).join('\n')}

You can answer questions about stock levels, identify items below threshold, and execute restocks via tools.
If you execute a restock, explain what you did.`,
          tools: [{ functionDeclarations: [restockTool, deliverOrderTool] }]
        });

        chatSessionRef.current = model.startChat({ history: [] });
      } catch (err) {
        console.error("Failed to initialize Gemini:", err);
        setMessages([{ role: 'model', text: 'Failed to connect to the AI service. Please check your API key.' }]);
      }
    }
  }, [inventoryItems, orders]);

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
          if (call.name === 'restock_items') {
            const args = call.args as any;
            let restockedNames: string[] = [];
            
            for (const toAdd of args.items) {
              const invItem = inventoryItems.find(i => i.id === toAdd.itemId);
              if (invItem && toAdd.addQuantity > 0) {
                await updateStock(invItem.id, invItem.stock_quantity + toAdd.addQuantity);
                restockedNames.push(`Added ${toAdd.addQuantity} to ${invItem.name}`);
              }
            }

            result = await chatSessionRef.current.sendMessage([{
              functionResponse: {
                name: 'restock_items',
                response: { status: 'success', summary: restockedNames }
              }
            }]);
          } else if (call.name === 'deliver_order') {
             const args = call.args as any;
             const order = orders.find(o => o.id === args.orderId);
             if (order) {
               await updateOrderStatus(order.id, 'delivered');
               result = await chatSessionRef.current.sendMessage([{
                functionResponse: {
                  name: 'deliver_order',
                  response: { status: 'success', orderId: order.id }
                }
              }]);
             } else {
               result = await chatSessionRef.current.sendMessage([{
                functionResponse: {
                  name: 'deliver_order',
                  response: { status: 'error', message: 'Order not found' }
                }
              }]);
             }
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: result.response.text() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error executing that.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 bottom-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 duration-300'}`}
      >
        <Bot className="h-7 w-7 animate-bounce" />
      </button>

      {isOpen && (
        <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 w-[90vw] md:w-[400px] h-[80vh] max-h-[600px] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-primary p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary-foreground" />
              <div>
                <h3 className="font-heading font-bold text-primary-foreground text-sm">ERP Assistant</h3>
                <p className="text-[10px] text-primary-foreground/70">Restock & Order Management</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 p-1 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background border border-border text-foreground rounded-bl-none'}`}>
                  {m.role === 'model' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm">
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
                <div className="bg-background border border-border text-foreground rounded-2xl rounded-bl-none p-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-background border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="E.g. Restock all low items..."
                className="flex-1 rounded-full bg-muted border-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                disabled={isTyping}
              />
              <Button onClick={handleSend} disabled={isTyping || !input.trim()} size="icon" className="rounded-full shrink-0 h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
