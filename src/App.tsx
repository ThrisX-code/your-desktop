/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Task } from './types';
import { TaskForm } from './components/TaskForm';
import { Timeline } from './components/Timeline';
import { PromptOrchestrator } from './components/PromptOrchestrator';
import { Metrics } from './components/Metrics';
import { SprintNotes } from './components/SprintNotes';
import { playAlarm } from './lib/audio';
import { Auth } from './components/Auth';
import { auth, db, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [signOutState, setSignOutState] = useState<'idle' | 'first' | 'second'>('idle');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      fetchedTasks.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(fetchedTasks);
    }, (error) => {
      console.error("Tasks snapshot error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./timerWorker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        setRemainingSeconds(e.data.seconds);
      } else if (e.data.type === 'done') {
        setIsTimerRunning(false);
        setActiveTimerId(null);
        setRemainingSeconds(0);
        playAlarm();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Time Over!', {
            body: 'Your active sprint has finished.',
          });
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleToggleTimer = (taskId: string, durationMin: number) => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    if (activeTimerId === taskId) {
      if (isTimerRunning) {
        setIsTimerRunning(false);
        workerRef.current?.postMessage({ action: 'stop' });
      } else {
        setIsTimerRunning(true);
        workerRef.current?.postMessage({ action: 'start', seconds: remainingSeconds });
      }
    } else {
      setActiveTimerId(taskId);
      const newSeconds = durationMin * 60;
      setRemainingSeconds(newSeconds);
      setIsTimerRunning(true);
      workerRef.current?.postMessage({ action: 'start', seconds: newSeconds });
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTaskData,
        userId: user.uid,
        completed: false,
        createdAt: Date.now(), // Use standard timestamp for ease of use here
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await updateDoc(doc(db, 'tasks', id), {
        completed: !task.completed
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      if (activeTimerId === id) {
        setActiveTimerId(null);
        setIsTimerRunning(false);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSignOut = () => {
    setSignOutState('first');
  };

  const confirmSignOut = () => {
    if (signOutState === 'first') {
      setSignOutState('second');
    } else if (signOutState === 'second') {
      auth.signOut();
      setSignOutState('idle');
    }
  };

  const cancelSignOut = () => {
    setSignOutState('idle');
  };

  if (!user) {
    return <Auth />;
  }

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
        <div className="flex flex-col items-end text-right">
          <p className="text-lg font-mono text-indigo-400">{formattedDate}</p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 font-bold"
            >
              Sign Out
            </button>
          </div>
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

      {/* Sprint Notes Section */}
      <AnimatePresence mode="wait">
        {selectedTask && (
          <motion.div
            key={selectedTask.id}
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SprintNotes task={selectedTask} user={user} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      {signOutState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Are you sure you're leaving{signOutState === 'second' ? ' (Are you really sure?)' : ''}
            </h3>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={cancelSignOut}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                No, stay
              </button>
              <button 
                onClick={confirmSignOut}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Yes, I'm sure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
