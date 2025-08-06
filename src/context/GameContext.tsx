import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Player {
  id: string;
  name: string;
  ticketCount: number;
  isHost: boolean;
}

interface GameState {
  currentNumber: number | null;
  calledNumbers: number[];
  availableNumbers: number[];
}

interface GameContextType {
  gameState: GameState;
  players: Player[];
  callNumber: (number: number) => void;
  resetGame: () => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
}

type GameAction = 
  | { type: 'CALL_NUMBER'; payload: number }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string };

const initialGameState: GameState = {
  currentNumber: null,
  calledNumbers: [],
  availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
};

const initialPlayers: Player[] = [];

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CALL_NUMBER':
      return {
        ...state,
        currentNumber: action.payload,
        calledNumbers: [...state.calledNumbers, action.payload],
        availableNumbers: state.availableNumbers.filter(n => n !== action.payload),
      };
    case 'RESET_GAME':
      return {
        ...initialGameState,
        availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
      };
    default:
      return state;
  }
};

const playersReducer = (state: Player[], action: GameAction): Player[] => {
  switch (action.type) {
    case 'ADD_PLAYER':
      if (state.find(p => p.id === action.payload.id)) return state;
      return [...state, action.payload];
    case 'REMOVE_PLAYER':
      return state.filter(p => p.id !== action.payload);
    default:
      return state;
  }
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, initialGameState);
  const [players, playersDispatch] = useReducer(playersReducer, initialPlayers);

  const callNumber = (number: number) => {
    gameDispatch({ type: 'CALL_NUMBER', payload: number });
  };

  const resetGame = () => {
    gameDispatch({ type: 'RESET_GAME' });
  };

  const addPlayer = (player: Player) => {
    playersDispatch({ type: 'ADD_PLAYER', payload: player });
  };

  const removePlayer = (playerId: string) => {
    playersDispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  return (
    <GameContext.Provider value={{
      gameState,
      players,
      callNumber,
      resetGame,
      addPlayer,
      removePlayer,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};