import React, { useState } from 'react';
import { Dice6, Users, Play, Star, Sparkles } from 'lucide-react';
import { roomExists } from '../utils/roomStorage';
import { useRoomSync } from '../hooks/useRoomSync';

interface LandingPageProps {
  onUserLogin: (username: string) => void;
  onRoomJoin: (roomId: string) => void;
  currentUser: string | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUserLogin, onRoomJoin, currentUser }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [error, setError] = useState('');
  const { joinRoom, createRoom } = useRoomSync(null, currentUser);

  const handleLogin = () => {
    if (username.trim()) {
      onUserLogin(username.trim());
      setShowRoomInput(true);
      setError('');
    }
  };

  const handleCreateRoom = () => {
    if (!currentUser) return;
    
    const newRoomId = `ROOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const success = createRoom(newRoomId, currentUser);
    if (success) {
      onRoomJoin(newRoomId);
    } else {
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !currentUser) return;
    
    const trimmedRoomId = roomId.trim().toUpperCase();
    console.log('Attempting to join room:', trimmedRoomId);
    
    if (!roomExists(trimmedRoomId)) {
      console.log('Room does not exist:', trimmedRoomId);
      setError('Room not found. Please check the Room ID.');
      return;
    }
    
    console.log('Room exists, attempting to join...');
    const success = joinRoom(trimmedRoomId, currentUser);
    if (!success) {
      console.log('Failed to join room');
      setError('Unable to join room. It may be full or no longer exist.');
      return;
    }
    
    console.log('Successfully joined room');
    setError('');
    onRoomJoin(trimmedRoomId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animation: 'float 6s ease-in-out infinite',
          }}
        />
      ))}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Dice6 className="w-16 h-16 text-yellow-400 mr-4 animate-spin-slow" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Tambola Pro
              </h1>
              <Sparkles className="w-16 h-16 text-yellow-400 ml-4 animate-pulse" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the ultimate Tambola game with friends! Generate perfect tickets, enjoy voice announcements, and compete in private rooms.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <Star className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Tickets</h3>
              <p className="text-gray-300 text-sm">Generate valid 9x3 grid tickets following all Tambola rules automatically.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <Users className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Private Rooms</h3>
              <p className="text-gray-300 text-sm">Create or join private rooms with up to 4 players for exclusive games.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <Play className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Voice Calls</h3>
              <p className="text-gray-300 text-sm">Hear numbers announced clearly with our advanced speech synthesis.</p>
            </div>
          </div>

          {/* Login/Room Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
            {!currentUser ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white text-center">Join the Game</h2>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={!username.trim()}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">Welcome, {currentUser}!</h2>
                  <p className="text-gray-300">Choose how to start playing</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105"
                  >
                    Create New Room
                  </button>
                  
                  <div className="text-center text-gray-300">or</div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    <button
                      onClick={handleJoinRoom}
                      disabled={!roomId.trim()}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;