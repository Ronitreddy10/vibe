// Simple room storage using localStorage for demo purposes
// In production, you'd want to use a real backend like Supabase

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
}

const ROOMS_KEY = 'tambola_rooms';
const ROOM_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const saveRoom = (roomData: RoomData): void => {
  try {
    const rooms = getRooms();
    rooms[roomData.id] = roomData;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch (error) {
    console.error('Failed to save room:', error);
  }
};

export const getRoom = (roomId: string): RoomData | null => {
  try {
    const rooms = getRooms();
    const room = rooms[roomId];
    
    if (!room) return null;
    
    // Check if room has expired
    if (Date.now() - room.createdAt > ROOM_EXPIRY) {
      deleteRoom(roomId);
      return null;
    }
    
    return room;
  } catch (error) {
    console.error('Failed to get room:', error);
    return null;
  }
};

export const getRooms = (): Record<string, RoomData> => {
  try {
    const roomsData = localStorage.getItem(ROOMS_KEY);
    return roomsData ? JSON.parse(roomsData) : {};
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return {};
  }
};

export const deleteRoom = (roomId: string): void => {
  try {
    const rooms = getRooms();
    delete rooms[roomId];
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch (error) {
    console.error('Failed to delete room:', error);
  }
};

export const roomExists = (roomId: string): boolean => {
  return getRoom(roomId) !== null;
};

export const addPlayerToRoom = (roomId: string, player: { id: string; name: string; ticketCount: number; isHost: boolean }): boolean => {
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    // Check if player already exists
    const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex >= 0) {
      // Update existing player
      room.players[existingPlayerIndex] = player;
    } else {
      // Add new player if room isn't full
      if (room.players.length >= 4) return false;
      room.players.push(player);
    }
    
    saveRoom(room);
    return true;
  } catch (error) {
    console.error('Failed to add player to room:', error);
    return false;
  }
};

export const removePlayerFromRoom = (roomId: string, playerId: string): boolean => {
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    room.players = room.players.filter(p => p.id !== playerId);
    
    // If no players left, delete the room
    if (room.players.length === 0) {
      deleteRoom(roomId);
    } else {
      // If host left, make first player the new host
      if (!room.players.some(p => p.isHost)) {
        room.players[0].isHost = true;
        room.host = room.players[0].id;
      }
      saveRoom(room);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to remove player from room:', error);
    return false;
  }
};

export const updateRoomGameState = (roomId: string, gameState: RoomData['gameState']): boolean => {
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    room.gameState = gameState;
    saveRoom(room);
    return true;
  } catch (error) {
    console.error('Failed to update room game state:', error);
    return false;
  }
};