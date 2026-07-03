import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TimelineProps {
  tasks: Task[];
  selectedTaskId: string | null;
  activeTimerId: string | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string, durationMin: number) => void;
}

const categoryColors = {
  Coding: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Study: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Hardware: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  General: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function Timeline({ tasks, selectedTaskId, activeTimerId, remainingSeconds, isTimerRunning, onSelectTask, onToggleComplete, onDelete, onToggleTimer }: TimelineProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 text-sm">
        No active sprints. Create a task to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-1">
      <AnimatePresence>
        {tasks.map(task => {
          const catClass = `category-tag-${task.category.toLowerCase()}`;
          return (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                p-4 border rounded-lg flex items-start justify-between cursor-pointer transition-all
                ${selectedTaskId === task.id ? 'bg-slate-800/60 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'}
                ${task.completed ? 'opacity-50' : ''}
              `}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catClass}`}>
                    {task.category}
                  </span>
                  <h3 className={`font-semibold text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Duration: {task.duration} min</span>
                  <span>•</span>
                  <span>Priority: High</span>
                  {activeTimerId === task.id && (
                    <>
                      <span>•</span>
                      <span className={`font-mono font-bold ${isTimerRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatTime(remainingSeconds)}
                      </span>
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-600 shrink-0">
                {!task.completed && (
                  <button 
                    className={`p-1.5 transition-colors ${activeTimerId === task.id && isTimerRunning ? 'text-emerald-400' : 'hover:text-emerald-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTimer(task.id, task.duration);
                    }}
                    title={activeTimerId === task.id && isTimerRunning ? "Pause Timer" : "Start Timer"}
                  >
                    {activeTimerId === task.id && isTimerRunning ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 9v6m4-6v6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                )}
                <button 
                  className={`p-1.5 transition-colors ${task.completed ? 'text-indigo-400' : 'hover:text-indigo-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                <button 
                  className="p-1.5 hover:text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Delete Sprint"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
