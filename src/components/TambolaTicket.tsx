import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface TambolaTicketProps {
  ticket: number[][];
  calledNumbers: number[];
  ticketIndex: number;
}

const TambolaTicket: React.FC<TambolaTicketProps> = ({ ticket, calledNumbers, ticketIndex }) => {
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());

  const toggleNumber = (number: number) => {
    if (number === 0) return;
    
    const newMarked = new Set(markedNumbers);
    if (newMarked.has(number)) {
      newMarked.delete(number);
    } else {
      newMarked.add(number);
    }
    setMarkedNumbers(newMarked);
  };

  const isNumberCalled = (number: number) => calledNumbers.includes(number);
  const isNumberMarked = (number: number) => markedNumbers.has(number);

  const getCellClassName = (number: number) => {
    let baseClass = "h-10 w-12 flex items-center justify-center text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ";
    
    if (number === 0) {
      return baseClass + "bg-gray-800/50 text-gray-600";
    }
    
    if (isNumberMarked(number)) {
      return baseClass + "bg-green-500 text-white shadow-lg cursor-pointer";
    }
    
    if (isNumberCalled(number)) {
      return baseClass + "bg-yellow-400 text-black shadow-lg cursor-pointer animate-pulse";
    }
    
    return baseClass + "bg-white/20 backdrop-blur text-white border border-white/30 cursor-pointer hover:bg-white/30";
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Ticket #{ticketIndex + 1}</h3>
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{markedNumbers.size} marked</span>
        </div>
      </div>
      
      <div className="grid grid-cols-9 gap-1">
        {ticket.map((row, rowIndex) =>
          row.map((number, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(number)}
              onClick={() => toggleNumber(number)}
              disabled={number === 0}
            >
              {number || ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default TambolaTicket;