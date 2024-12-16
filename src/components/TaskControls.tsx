import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface TaskControlsProps {
  active: boolean;
  onToggleActive: () => void;
  onRefresh: () => void;
}

export function TaskControls({ active, onToggleActive, onRefresh }: TaskControlsProps) {
  return (
    <div className="space-x-2">
      <button 
        onClick={onToggleActive}
        className="text-indigo-600 hover:text-indigo-900"
      >
        {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button 
        onClick={onRefresh}
        className="text-indigo-600 hover:text-indigo-900"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}