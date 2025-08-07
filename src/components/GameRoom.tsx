import React, { useState, useEffect } from 'react';
import { LogOut, Users, Volume2, VolumeX } from 'lucide-react';
import TambolaTicket from './TambolaTicket';
import NumberCaller from './NumberCaller';
import PlayersList from './PlayersList';
import { useGame } from '../context/GameContext';
import { useRoomSync } from '../hooks/useRoomSync';

interface GameRoomProps {
  user: string;
  roomId: string;
  onLeaveRoom: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ user, roomId, onLeaveRoom }) => {
  const [tickets, setTickets] = useState<number[][][]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { gameState, players, addPlayer } = useGame();
  const { leaveRoom } = useRoomSync(roomId, user);

  useEffect(() => {
    // Player is already added through room sync
  }, []);

  const handleLeaveRoom = () => {
    leaveRoom();
    onLeaveRoom();
  };

  const generateTickets = (count: number = 1) => {
    const newTickets: number[][][] = [];
    
    for (let t = 0; t < count; t++) {
      const ticket: number[][] = Array(3).fill(null).map(() => Array(9).fill(0));
      
      // Generate numbers for each column
      for (let col = 0; col < 9; col++) {
        const min = col * 10 + 1;
        const max = col === 8 ? 90 : (col + 1) * 10;
        const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        // Shuffle and take 3 numbers for this column
        for (let i = availableNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
        }
        
        const columnNumbers = availableNumbers.slice(0, 3).sort((a, b) => a - b);
        columnNumbers.forEach((num, row) => {
          ticket[row][col] = num;
        });
      }
      
      // Ensure each row has exactly 5 numbers
      for (let row = 0; row < 3; row++) {
        const filledPositions = ticket[row].map((num, index) => ({ num, index }))
          .filter(item => item.num > 0);
        
        // If we have more than 5 numbers, randomly remove some
        while (filledPositions.length > 5) {
          const randomIndex = Math.floor(Math.random() * filledPositions.length);
          const positionToRemove = filledPositions.splice(randomIndex, 1)[0];
          ticket[row][positionToRemove.index] = 0;
        }
      }
      
      newTickets.push(ticket);
    }
    
    setTickets(newTickets);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Room: {roomId}</h1>
            <p className="text-gray-300">Player: {user}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-lg rounded-lg border border-red-500/30 text-red-200 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Tickets</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => generateTickets(1)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105"
                  >
                    Generate 1 Ticket
                  </button>
                  <button
                    onClick={() => generateTickets(6)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
                  >
                    Generate 6 Tickets
                  </button>
                </div>
              </div>
              
              <div className="grid gap-4">
                {tickets.map((ticket, index) => (
                  <TambolaTicket 
                    key={index} 
                    ticket={ticket} 
                    calledNumbers={gameState.calledNumbers}
                    ticketIndex={index}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Number Caller */}
            <NumberCaller soundEnabled={isSoundEnabled} roomId={roomId} />
            
            {/* Players List */}
            <PlayersList players={players} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default GameRoom;