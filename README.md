🚂 RailPantry Go
A streamlined food management and ordering solution for rail travel, built with speed and reliability in mind.

🚀 Tech Stack
Frontend: React + Vite

Language: TypeScript

Styling: Tailwind CSS

Database & Auth: Supabase

Runtime/Bundler: Bun (Optional, based on bun.lock)

🛠️ Getting Started
Prerequisites
Ensure you have Node.js or Bun installed on your system.

Installation
Clone the repository:

Bash
git clone https://github.com/Arnav1115/railpantry-go.git
cd railpantry-go
Install dependencies:

Bash
npm install
# or
bun install
Environment Setup
Create a .env file in the root directory and add your Supabase credentials:

Code snippet
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Running Locally
Bash
npm run dev
The app will be available at http://localhost:5173.

📁 Project Structure
src/: Application source code.

supabase/: Database migrations and configuration.

public/: Static assets.

components.json: Shadcn/ui configuration.
