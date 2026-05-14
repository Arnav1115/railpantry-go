# 🚂 RailPantry

> **Fresh, hygienic food delivered directly to your train seat.** A modern AI-powered railway meal delivery and pantry management startup platform.

![RailPantry Banner](https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop)

---

## 🌟 Executive Summary

**RailPantry** bridges the gap between train passengers craving hot, high-quality food and pantry vendors seeking efficient, coach-specific order fulfillment. Built with modern web architecture (React + TypeScript + Vite + Tailwind CSS + Framer Motion), RailPantry delivers an ultra-premium, Swiggy/Zomato-level consumer experience paired with a robust ERP dashboard for railway operations.

---

## ✨ Key Features

### 🚄 1. Passenger App Shell (Mobile-First Shell)
- **Instant PNR Smart Flow:** Enter a 10-digit PNR to auto-detect train details, boarding stations, destination arrival times, and assigned coaches.
- **Modern Food Discovery:** Horizontal category filters, best-seller tags, veg/non-veg indicator dots, station availability markers, and live delivery ETAs.
- **Swiggy-Style Live Order Tracking:** Stepper timeline tracking real-time delivery milestones (*Preparing* ➔ *Packed* ➔ *Rider Assigned* ➔ *Train Arriving* ➔ *Delivered to Seat*).
- **Secure Delivery PIN:** High-contrast OTP verification codes required for order handover.

### 🦉 2. FoodOwl (Silent Night Delivery)
- **Late Night Essentials:** Active between 11 PM and 5 AM.
- **Silent Delivery:** Focuses on undisturbed delivery of water, medicine, biscuits, and hydration directly to seats.
- **Immersive Dark Mode:** Premium indigo/violet night-themed UI optimized for low-light travel.

### 🤖 3. AI-Powered Meal Assistant (Gemini 2.5 Flash)
- **Journey-Aware Context:** Analyzes travel route, weather conditions, time of day, and FSSAI standards.
- **Smart Suggestion Chips:** One-click recommendation prompts (e.g., *"Suggest a light meal for my night journey"*).
- **Agentic Cart Control:** Autonomous tool calling (`add_to_cart`) allows the AI assistant to instantly prepare orders directly from chat.

### 🔐 4. Authorized Vendor ERP Dashboard
- **Role-Based Coach Filtering:**
  - `B4VENDOR` (Pwd: `4VENDOR`) ➔ Manages orders exclusively for Coach **B4**.
  - `B1VENDOR` (Pwd: `1VENDOR`) ➔ Manages orders exclusively for Coach **B1**.
  - `ADMIN` (Pwd: `ADMIN`) ➔ Master access to all coaches and pantry inventory.
- **Inventory Supply Chain:** Network-wide SKU tracking, low stock threshold warnings, and one-click station restock requests.

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn UI
- **Animations:** Framer Motion
- **Database / Auth:** Supabase Client SDK
- **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### 1. Installation
Clone the repo and install dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🛡️ Trust & Safety Guarantees
- **FSSAI Verified:** 100% hygienic food prepared under strict government food safety regulations.
- **On-Time Delivery:** Guaranteed delivery at scheduled station halts.
- **100% Refund Guarantee:** Immediate automated refunds for any missed station deliveries.

---

## 📜 License
© 2026 RailPantry Logistics Systems. All rights reserved.
