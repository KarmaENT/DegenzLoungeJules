import React from 'react';
import { useDrag } from 'react-dnd';

interface AgentCardProps {
  id: number;
  name: string;
  role: string;
  personality: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  id, 
  name, 
  role, 
  personality, 
  isSelected = false,
  onSelect 
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'agent',
    item: { id, name, role, personality },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div
      ref={drag}
      className={`agent-card p-4 mb-3 rounded-lg shadow cursor-pointer ${
        isDragging ? 'opacity-50 border-2 border-blue-500' : 'opacity-100'
      } ${
        isSelected ? 'border-2 border-green-500 bg-green-50' : 'bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <div className="text-sm text-gray-600 font-medium mt-1">{role}</div>
      <div className="text-xs text-gray-500 mt-2">Personality: {personality}</div>
      <div className="mt-3 flex justify-between items-center">
        <span className={`inline-block text-xs px-2 py-1 rounded ${
          isSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isSelected ? 'Selected' : 'Click to select'}
        </span>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          Drag to sandbox
        </span>
      </div>
    </div>
  );
};

export default AgentCard;
