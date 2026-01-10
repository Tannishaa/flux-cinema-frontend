# 🎟️ Flux Cinema (Frontend)

**A High-Concurrency Ticketing Engine demonstrating Race Conditions, Distributed Locking, and Eventual Consistency.**

This is the frontend interface for the **Flux Order** system. It simulates a high-traffic "Flash Sale" environment where multiple users compete for limited inventory in real-time.

🔗 **Live Demo:** [https://flux-cinema-frontend.vercel.app/]

🔗 **Backend Repository:** [https://github.com/Tannishaa/flux-order]

## Key Features

* **Interactive Seat Map:** Visual grid selection for specific inventory items (Seats A1-C4).
* **Real-Time Polling:** Automatically syncs with the backend every 2 seconds to gray out sold seats without page refreshes.
* **Race Condition Simulation:** Designed to allow multiple users to attempt booking the same seat simultaneously to test backend locking mechanisms.
* **Next.js Proxying:** Uses `next.config.mjs` rewrites to securely forward traffic to the Python/Flask backend, avoiding CORS issues.

## Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Styling:** Tailwind CSS
* **Effects:** Canvas Confetti, React Hot Toast
* **Backend Integration:** REST API (Flask + AWS SQS)

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Tannishaa/flux-cinema-frontend.git
cd flux-cinema-frontend
npm install
```
### 2. Configure Proxy (Optional)
The project is pre-configured to talk to the live backend. If you are running the backend locally, update `next.config.mjs`:
```JavaScript

destination: 'http://127.0.0.1:5000/:path*' // For local dev
// destination: 'https://flux-api-wjqx.onrender.com/:path*' // For Cloud
```
### 3. Run Locally
```Bash
npm run dev
```
Open http://localhost:3000 with your browser.

## How to Test the "Race Condition"
1. Open the app in two different browser windows (Incognito vs Normal).

2. Select **Seat B2** in Window A (Do not buy yet).

3. Select **Seat B2** in Window B.

4. Click **"Book Seat"** in both windows as fast as possible.

5. **Result:** Only one request will succeed. The other will be rejected by the backend's Redis Distributed Lock.
---
*Part of the Flux Order Event-Driven Architecture Project.*