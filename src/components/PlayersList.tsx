import React from 'react';
import { Users, Crown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  ticketCount: number;
  isHost: boolean;
}

interface PlayersListProps {
  players: Player[];
}

const PlayersList: React.FC<PlayersListProps> = ({ players }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Players ({players.length}/4)</h3>
      </div>
      
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-2">
              {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
              <span className="text-white font-medium">{player.name}</span>
            </div>
            <div className="text-gray-300 text-sm">
              {player.ticketCount} tickets
            </div>
          </div>
        ))}
        
        {players.length < 4 && (
          <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-600 rounded-lg">
            Waiting for more players...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;