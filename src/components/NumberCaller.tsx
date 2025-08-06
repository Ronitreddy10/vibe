import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface NumberCallerProps {
  soundEnabled: boolean;
}

const NumberCaller: React.FC<NumberCallerProps> = ({ soundEnabled }) => {
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState<NodeJS.Timeout | null>(null);
  const { gameState, callNumber, resetGame } = useGame();

  const numberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                  'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    return num.toString();
  };

  const speakNumber = (number: number) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(numberToWords(number));
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const callNextNumber = () => {
    if (gameState.availableNumbers.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * gameState.availableNumbers.length);
    const number = gameState.availableNumbers[randomIndex];
    callNumber(number);
    speakNumber(number);
  };

  const toggleAutoMode = () => {
    if (isAutoMode) {
      setIsAutoMode(false);
      if (autoInterval) {
        clearInterval(autoInterval);
        setAutoInterval(null);
      }
    } else {
      setIsAutoMode(true);
      const interval = setInterval(callNextNumber, 3000);
      setAutoInterval(interval);
    }
  };

  const resetGameHandler = () => {
    setIsAutoMode(false);
    if (autoInterval) {
      clearInterval(autoInterval);
      setAutoInterval(null);
    }
    resetGame();
  };

  useEffect(() => {
    return () => {
      if (autoInterval) {
        clearInterval(autoInterval);
      }
    };
  }, [autoInterval]);

  const getNumberColor = (number: number) => {
    if (number <= 15) return 'text-red-400';
    if (number <= 30) return 'text-blue-400';
    if (number <= 45) return 'text-green-400';
    if (number <= 60) return 'text-yellow-400';
    if (number <= 75) return 'text-purple-400';
    return 'text-pink-400';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Number Caller</h2>
        <div className="text-6xl font-bold mb-4">
          {gameState.currentNumber ? (
            <span className={`${getNumberColor(gameState.currentNumber)} animate-bounce`}>
              {gameState.currentNumber}
            </span>
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>
        {gameState.currentNumber && (
          <p className="text-lg text-gray-300 capitalize">
            {numberToWords(gameState.currentNumber)}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={callNextNumber}
            disabled={gameState.availableNumbers.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Call Number
          </button>
          <button
            onClick={toggleAutoMode}
            className={`px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 ${
              isAutoMode 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isAutoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={resetGameHandler}
          className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Game
        </button>

        <div className="text-center text-sm text-gray-300">
          Numbers Left: {gameState.availableNumbers.length}
        </div>
      </div>

      {/* Called Numbers History */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Called Numbers</h3>
        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
          {gameState.calledNumbers.map((number, index) => (
            <div
              key={index}
              className={`p-2 rounded text-center font-semibold text-sm ${getNumberColor(number)} bg-white/10 border border-white/20`}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberCaller;