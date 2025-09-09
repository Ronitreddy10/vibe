// Enhanced room storage with better cross-device support
// Using a combination of localStorage and URL-based room sharing

export interface RoomData {
  id: string;
  host: string;
  players: Array<{
    id: string;
    name: string;
    ticketCount: number;
    isHost: boolean;
  }>;
  gameState: {
    currentNumber: number | null;
    calledNumbers: number[];
    availableNumbers: number[];
  };
  createdAt: number;
  lastUpdated: number;
}

const ROOMS_KEY = 'tambola_rooms';
const ROOM_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Generate a simple hash for room data to help with synchronization
const generateRoomHash = (roomData: RoomData): string => {
  const dataString = JSON.stringify({
    players: roomData.players,
    gameState: roomData.gameState,
    lastUpdated: roomData.lastUpdated
  });
  return btoa(dataString).slice(0, 16);
};

export const saveRoom = (roomData: RoomData): void => {
  try {
    roomData.lastUpdated = Date.now();
    const rooms = getRooms();
    rooms[roomData.id] = roomData;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    console.log('✅ Room saved successfully:', roomData.id);
    
    // Also save to a global key for easier debugging
    localStorage.setItem(`room_${roomData.id}`, JSON.stringify(roomData));
  } catch (error) {
    console.error('❌ Failed to save room:', error);
  }
};

export const getRoom = (roomId: string): RoomData | null => {
  try {
    console.log('🔍 Looking for room:', roomId);
    
    // First try to get from rooms collection
    const rooms = getRooms();
    let room = rooms[roomId];
    
    // If not found, try individual room key
    if (!room) {
      const roomData = localStorage.getItem(`room_${roomId}`);
      if (roomData) {
        room = JSON.parse(roomData);
        console.log('📦 Found room in individual storage');
      }
    }
    
    if (!room) {
      console.log('❌ Room not found:', roomId);
      console.log('📋 Available rooms:', Object.keys(rooms));
      return null;
    }
    
    // Check if room has expired
    if (Date.now() - room.createdAt > ROOM_EXPIRY) {
      console.log('⏰ Room expired, deleting:', roomId);
      deleteRoom(roomId);
      return null;
    }
    
    console.log('✅ Room found:', roomId, 'Players:', room.players.length);
    return room;
  } catch (error) {
    console.error('❌ Failed to get room:', error);
    return null;
  }
};

export const getRooms = (): Record<string, RoomData> => {
  try {
    const roomsData = localStorage.getItem(ROOMS_KEY);
    return roomsData ? JSON.parse(roomsData) : {};
  } catch (error) {
    console.error('❌ Failed to get rooms:', error);
    return {};
  }
};

export const deleteRoom = (roomId: string): void => {
  try {
    const rooms = getRooms();
    delete rooms[roomId];
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    localStorage.removeItem(`room_${roomId}`);
    console.log('🗑️ Room deleted:', roomId);
  } catch (error) {
    console.error('❌ Failed to delete room:', error);
  }
};

export const roomExists = (roomId: string): boolean => {
  const room = getRoom(roomId);
  const exists = room !== null;
  console.log('🔍 Room exists check:', roomId, '→', exists);
  return exists;
};

export const addPlayerToRoom = (roomId: string, player: { id: string; name: string; ticketCount: number; isHost: boolean }): boolean => {
  try {
    console.log('👤 Adding player to room:', roomId, player.name);
    const room = getRoom(roomId);
    if (!room) {
      console.log('❌ Room not found for adding player:', roomId);
      return false;
    }
    
    // Check if player already exists
    const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex >= 0) {
      console.log('🔄 Updating existing player:', player.name);
      room.players[existingPlayerIndex] = player;
    } else {
      // Add new player if room isn't full
      if (room.players.length >= 4) {
        console.log('🚫 Room is full:', roomId);
        return false;
      }
      console.log('➕ Adding new player:', player.name);
      room.players.push(player);
    }
    
    saveRoom(room);
    console.log('✅ Player added successfully. Total players:', room.players.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to add player to room:', error);
    return false;
  }
};

export const removePlayerFromRoom = (roomId: string, playerId: string): boolean => {
  try {
    console.log('👤 Removing player from room:', roomId, playerId);
    const room = getRoom(roomId);
    if (!room) return false;
    
    const initialPlayerCount = room.players.length;
    room.players = room.players.filter(p => p.id !== playerId);
    
    console.log('📊 Players before:', initialPlayerCount, 'after:', room.players.length);
    
    // If no players left, delete the room
    if (room.players.length === 0) {
      console.log('🗑️ No players left, deleting room');
      deleteRoom(roomId);
    } else {
      // If host left, make first player the new host
      if (!room.players.some(p => p.isHost)) {
        console.log('👑 Making new host:', room.players[0].name);
        room.players[0].isHost = true;
        room.host = room.players[0].id;
      }
      saveRoom(room);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to remove player from room:', error);
    return false;
  }
};

export const updateRoomGameState = (roomId: string, gameState: RoomData['gameState']): boolean => {
  try {
    const room = getRoom(roomId);
    if (!room) {
      console.log('❌ Room not found for game state update:', roomId);
      return false;
    }
    
    room.gameState = gameState;
    saveRoom(room);
    console.log('🎮 Game state updated for room:', roomId);
    return true;
  } catch (error) {
    console.error('❌ Failed to update room game state:', error);
    return false;
  }
};

// Helper function to list all rooms (for debugging)
export const listAllRooms = (): void => {
  console.log('📋 All rooms in storage:');
  const rooms = getRooms();
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    console.log(`  ${roomId}: ${room.players.length} players, created ${new Date(room.createdAt).toLocaleString()}`);
  });
};

// Helper function to create a room with a specific ID (for testing)
export const createTestRoom = (roomId: string): void => {
  const testRoom: RoomData = {
    id: roomId,
    host: 'TestHost',
    players: [{
      id: 'TestHost',
      name: 'TestHost',
      ticketCount: 0,
      isHost: true
    }],
    gameState: {
      currentNumber: null,
      calledNumbers: [],
      availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1)
    },
    createdAt: Date.now(),
    lastUpdated: Date.now()
  };
  
  saveRoom(testRoom);
  console.log('🧪 Test room created:', roomId);
};