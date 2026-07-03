/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task } from './types';
import { TaskForm } from './components/TaskForm';
import { Timeline } from './components/Timeline';
import { PromptOrchestrator } from './components/PromptOrchestrator';
import { Metrics } from './components/Metrics';
import { playAlarm } from './lib/audio';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning && remainingSeconds > 0) {
      interval = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingSeconds]);

  const handleToggleTimer = (taskId: string, durationMin: number) => {
    if (activeTimerId === taskId) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerId(taskId);
      setRemainingSeconds(durationMin * 60);
      setIsTimerRunning(true);
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
    if (activeTimerId === id) {
      setActiveTimerId(null);
      setIsTimerRunning(false);
    }
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="min-h-screen w-full p-4 md:p-6 flex flex-col gap-4 selection:bg-indigo-500/30 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end pb-2 border-b border-slate-800 shrink-0 gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 uppercase">
            AI CO-PILOT NEXUS
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">System Status: Optimal // Core v4.2</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono text-indigo-400">{formattedDate}</p>
          <p className="text-xs text-slate-500">SESSION_ID: 8x-992-ALPHA</p>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Task Creation Form */}
        <div className="lg:col-span-3 bento-card">
          <TaskForm onAdd={handleAddTask} />
        </div>

        {/* Sprint Timeline View */}
        <div className="lg:col-span-5 bento-card">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4 shrink-0">Active Sprint Pipeline</h2>
          <Timeline 
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            activeTimerId={activeTimerId}
            remainingSeconds={remainingSeconds}
            isTimerRunning={isTimerRunning}
            onSelectTask={setSelectedTaskId}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onToggleTimer={handleToggleTimer}
          />
        </div>

        {/* AI Prompt Orchestrator Panel */}
        <div className="lg:col-span-4 bento-card flex flex-col">
          <PromptOrchestrator task={selectedTask} />
        </div>
      </div>

      {/* Metrics Widget */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 shrink-0 pb-2">
        <div className="flex-1 bento-card flex-col md:flex-row items-center justify-between px-6 py-4 md:h-[4rem] md:py-0 gap-4 md:gap-0">
          <Metrics tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
