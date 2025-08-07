import { useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { 
  getRoom, 
  saveRoom, 
  addPlayerToRoom, 
  removePlayerFromRoom, 
  updateRoomGameState,
  RoomData 
} from '../utils/roomStorage';

export const useRoomSync = (roomId: string | null, currentUser: string | null) => {
  const { gameState, players, addPlayer, removePlayer, setGameState, setPlayers } = useGame();

  // Sync game state to room storage
  const syncGameState = useCallback(() => {
    if (!roomId) return;
    updateRoomGameState(roomId, gameState);
  }, [roomId, gameState]);

  // Load room data and sync with local state
  const loadRoomData = useCallback(() => {
    if (!roomId) return;
    
    const room = getRoom(roomId);
    if (room) {
      // Update local game state
      setGameState(room.gameState);
      
      // Update local players list
      setPlayers(room.players);
    }
  }, [roomId, setGameState, setPlayers]);

  // Join room
  const joinRoom = useCallback((targetRoomId: string, username: string): boolean => {
    if (!targetRoomId) return false;
    
    console.log('joinRoom called with:', targetRoomId, username);
    const room = getRoom(targetRoomId);
    if (!room) {
      // Room doesn't exist
      console.log('Room not found in joinRoom');
      return false;
    }
    
    if (room.players.length >= 4) {
      // Room is full
      console.log('Room is full');
      return false;
    }
    
    // Check if player already exists in the room
    const existingPlayer = room.players.find(p => p.id === username);
    if (existingPlayer) {
      // Player already in room, just return success
      console.log('Player already in room');
      return true;
    }
    
    const player = {
      id: username,
      name: username,
      ticketCount: 0,
      isHost: false
    };
    
    const result = addPlayerToRoom(targetRoomId, player);
    console.log('addPlayerToRoom result:', result);
    return result;
  }, []);

  // Create room
  const createRoom = useCallback((roomId: string, hostName: string): boolean => {
    console.log('Creating room:', roomId, 'for host:', hostName);
    const newRoom: RoomData = {
      id: roomId,
      host: hostName,
      players: [{
        id: hostName,
        name: hostName,
        ticketCount: 0,
        isHost: true
      }],
      gameState: {
        currentNumber: null,
        calledNumbers: [],
        availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1)
      },
      createdAt: Date.now()
    };
    
    saveRoom(newRoom);
    console.log('Room created successfully');
    return true;
  }, []);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (!roomId || !currentUser) return;
    removePlayerFromRoom(roomId, currentUser);
  }, [roomId, currentUser]);

  // Sync changes to room storage when game state changes
  useEffect(() => {
    if (roomId && gameState.calledNumbers.length > 0) {
      syncGameState();
    }
  }, [gameState, syncGameState, roomId]);

  // Poll for room updates every 2 seconds
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      loadRoomData();
    }, 2000);

    // Load initial data
    loadRoomData();

    return () => clearInterval(interval);
  }, [roomId, loadRoomData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomId && currentUser) {
        removePlayerFromRoom(roomId, currentUser);
      }
    };
  }, [roomId, currentUser]);

  return {
    joinRoom,
    createRoom,
    leaveRoom,
    loadRoomData
  };
};