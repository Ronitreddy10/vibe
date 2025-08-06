import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import GameRoom from './components/GameRoom';
import { GameProvider } from './context/GameContext';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {!currentUser || !currentRoom ? (
          <LandingPage 
            onUserLogin={setCurrentUser}
            onRoomJoin={setCurrentRoom}
            currentUser={currentUser}
          />
        ) : (
          <GameRoom 
            user={currentUser}
            roomId={currentRoom}
            onLeaveRoom={() => {
              setCurrentRoom(null);
              setCurrentUser(null);
            }}
          />
        )}
      </div>
    </GameProvider>
  );
}

export default App;