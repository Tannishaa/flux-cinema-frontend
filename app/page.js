'use client';
import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const SEAT_ROWS = [
  ['A1', 'A2', 'A3', 'A4'],
  ['B1', 'B2', 'B3', 'B4'],
  ['C1', 'C2', 'C3', 'C4'],
];

export default function Home() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [soldSeats, setSoldSeats] = useState([]); // List of IDs ['A1', 'B2']
  const [loading, setLoading] = useState(false);
  
  // --- NEW STATE ---
  const [username, setUsername] = useState(""); 
  const myAttempts = useRef(new Set()); // Tracks seats WE tried to book

  const BUY_URL = "/api/buy"; 
  const INVENTORY_URL = "/api/inventory"; 

  // --- POLLING & REFEREE LOGIC ---
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(INVENTORY_URL);
        if (res.ok) {
          const data = await res.json(); // Returns: [{id: 'A1', owner: 'Tanisha'}, ...]
          
          // 1. Update Visuals (Disable buttons)
          const soldIds = data.map(item => item.id);
          setSoldSeats(soldIds);

          // 2. THE REFEREE CHECK 🏁
          data.forEach(seat => {
            // If WE tried to buy this seat...
            if (myAttempts.current.has(seat.id)) {
              
              // ...and it is now SOLD (has an owner)
              if (seat.owner === username) {
                // WE WON! 🎉
                toast.success(`VICTORY! You secured ${seat.id}!`, { duration: 5000, icon: '🏆' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
              } else {
                // WE LOST! 💀
                toast.error(`TOO SLOW! ${seat.owner} took ${seat.id}.`, { duration: 5000, icon: '💔' });
              }

              // Stop checking this seat (remove from attempts)
              myAttempts.current.delete(seat.id);
            }
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchInventory();
    const interval = setInterval(fetchInventory, 2000);
    return () => clearInterval(interval);
  }, [username]); // Restart polling if username changes

  const handleSeatClick = (seatId) => {
    if (soldSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
  };

  const buyTicket = async () => {
    if (!username) {
      toast.error("Please enter your name first!");
      return;
    }
    if (!selectedSeat) {
      toast.error("Please select a seat!");
      return;
    }

    setLoading(true);
    
    // Remember that we are trying to buy this seat
    myAttempts.current.add(selectedSeat);

    try {
      const res = await fetch(BUY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: username, item_id: selectedSeat }), // Send REAL Name
      });

      if (res.ok) {
        toast.loading(`Fighting for ${selectedSeat}...`, { duration: 2000 });
        setSelectedSeat(null);
      } else {
        toast.error("Failed to join queue.");
        myAttempts.current.delete(selectedSeat); // Don't wait for result
      }
    } catch (err) {
      toast.error("Network Error.");
      myAttempts.current.delete(selectedSeat);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-2xl w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl text-center">
        
        <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Flux Cinema
        </h1>
        <p className="text-gray-400 mb-6">
          <span className="text-green-400">●</span> Live Race Mode
        </p>

        {/* --- NAME INPUT --- */}
        <div className="mb-8 flex justify-center">
          <input 
            type="text" 
            placeholder="Enter Your Name" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 text-white text-center text-lg rounded-lg p-3 w-64 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="text-xs text-zinc-500 mb-6 uppercase tracking-widest">Screen</div>

        <div className="flex flex-col gap-3 items-center mb-10">
          {SEAT_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-3">
              {row.map((seat) => {
                const isSold = soldSeats.includes(seat);
                const isSelected = selectedSeat === seat;

                return (
                  <button
                    key={seat}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isSold}
                    className={`
                      w-12 h-12 rounded-t-lg rounded-b-md text-xs font-bold transition-all transform
                      ${isSold 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700' 
                        : isSelected 
                          ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] translate-y-[-4px]' 
                          : 'bg-zinc-700 text-gray-400 hover:bg-zinc-600 hover:scale-110'
                      }
                    `}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
          <button
            onClick={buyTicket}
            disabled={loading || !selectedSeat || !username}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || !selectedSeat || !username
                ? 'bg-zinc-700 cursor-not-allowed text-zinc-500'
                : 'bg-white text-black hover:bg-gray-200 shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'Processing...' : 'BOOK SEAT 🎟️'}
          </button>
        </div>
      </div>
    </div>
  );
}