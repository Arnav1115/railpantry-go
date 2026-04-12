export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  threshold: number;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  pnr_number: string;
  coach_seat: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'cooking' | 'delivered';
  otp: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends OrderItem {}
