'use client';
import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const SEAT_ROWS = [
  ['A1', 'A2', 'A3', 'A4'],
  ['B1', 'B2', 'B3', 'B4'],
  ['C1', 'C2', 'C3', 'C4'],
];

const TOTAL_SEATS = 12;

export default function Home() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [soldSeats, setSoldSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const userId = useRef("");
  const myAttempts = useRef(new Set());

  const BUY_URL = "/api/buy"; 
  const INVENTORY_URL = "/api/inventory"; 

  useEffect(() => {
    userId.current = "Guest_" + Math.floor(Math.random() * 10000);
  }, []);

  // --- POLLING & CONFIRMATION LOGIC ---
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(INVENTORY_URL);
        if (res.ok) {
          const data = await res.json(); 
          setSoldSeats(data);

          data.forEach(seat => {
            const seatId = typeof seat === 'string' ? seat : seat.id;
            const seatOwner = typeof seat === 'string' ? 'Taken' : seat.owner;

            if (myAttempts.current.has(seatId)) {
              if (seatOwner === userId.current) {
                // GREEN for Success
                toast(`Seat ${seatId} successfully booked!`, { 
                  duration: 4000, 
                  icon: null,
                  style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
                });
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } else {
                // RED for Taken/Unavailable
                toast(`Seat ${seatId} is unavailable.`, { 
                  duration: 4000, 
                  icon: null,
                  style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
                });
              }
              myAttempts.current.delete(seatId);
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
  }, []);

  const handleSeatClick = (seatId) => {
    const isSold = soldSeats.some(s => (typeof s === 'string' ? s : s.id) === seatId);
    if (isSold) return;
    setSelectedSeat(seatId);
  };

  const buyTicket = async () => {
    if (!selectedSeat) {
      // YELLOW for Warnings
      toast("Please select a seat!", { 
        icon: null,
        style: { background: '#f59e0b', color: '#fff', fontWeight: 'bold' }
      });
      return;
    }

    setLoading(true);
    myAttempts.current.add(selectedSeat);

    try {
      const res = await fetch(BUY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId.current, item_id: selectedSeat }), 
      });

      if (res.ok) {
        // BLUE for Processing
        toast(`Processing ${selectedSeat}...`, { 
          duration: 2000, 
          icon: null,
          style: { background: '#3b82f6', color: '#fff', fontWeight: 'bold' }
        });
        setSelectedSeat(null);
      } else {
        toast("Failed to process request.", { 
          icon: null,
          style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
        });
        myAttempts.current.delete(selectedSeat); 
      }
    } catch (err) {
      toast("Network Error.", { 
        icon: null,
        style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
      });
      myAttempts.current.delete(selectedSeat);
    } finally {
      setLoading(false);
    }
  };

  const occupiedCount = soldSeats.length;
  const remainingCount = TOTAL_SEATS - occupiedCount;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      {/* Ensure Toaster has no default styling conflicting with our custom styles */}
      <Toaster position="top-center" toastOptions={{ className: 'custom-toast' }} />
      
      <div className="max-w-2xl w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl text-center">
        
        <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Flux Cinema
        </h1>
        <p className="text-gray-400 mb-6">
          <span className="text-green-400">●</span> Live Booking System
        </p>

        <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-lg mb-8 border border-zinc-700/50">
          <div className="text-sm">
            <span className="text-zinc-400">Occupied: </span>
            <span className="font-bold text-red-400">{occupiedCount}</span>
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Screen</div>
          <div className="text-sm">
            <span className="text-zinc-400">Remaining: </span>
            <span className="font-bold text-green-400">{remainingCount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center mb-10">
          {SEAT_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {row.map((seat) => {
                const soldObj = soldSeats.find(s => (typeof s === 'string' ? s : s.id) === seat);
                const isSold = !!soldObj;
                const owner = typeof soldObj === 'object' ? soldObj.owner : null;
                const isSelected = selectedSeat === seat;

                return (
                  <button
                    key={seat}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isSold}
                    className={`
                      w-14 h-14 flex flex-col items-center justify-center rounded-t-lg rounded-b-md transition-all transform
                      ${isSold 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700' 
                        : isSelected 
                          ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] translate-y-[-4px]' 
                          : 'bg-zinc-700 text-gray-400 hover:bg-zinc-600 hover:scale-110'
                      }
                    `}
                  >
                    <span className="text-sm font-bold">{seat}</span>
                    {isSold && owner && (
                      <span className="text-[9px] truncate w-12 text-zinc-500 mt-1" title={owner}>
                        {owner}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
          <button
            onClick={buyTicket}
            disabled={loading || !selectedSeat}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || !selectedSeat
                ? 'bg-zinc-700 cursor-not-allowed text-zinc-500'
                : 'bg-white text-black hover:bg-gray-200 shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}