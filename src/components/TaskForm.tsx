import React, { useState } from 'react';
import { Category, Task } from '../types';

interface TaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Coding');
  const [duration, setDuration] = useState<number | ''>('');
  const [context, setContext] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !duration || !context) return;
    
    onAdd({
      name,
      category,
      duration: Number(duration),
      context,
    });
    
    setName('');
    setCategory('Coding');
    setDuration('');
    setContext('');
  };

  return (
    <>
      <h2 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center shrink-0">
        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> New Sprint
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Task Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="Refactor API layer..."
            required
          />
        </div>
        
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Category</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="Coding">Coding</option>
            <option value="Study">Study</option>
            <option value="Hardware">Hardware</option>
            <option value="General">General</option>
          </select>
        </div>
        
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Duration (min)</label>
          <input 
            type="number" 
            value={duration}
            onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            min="1"
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="25"
            required
          />
        </div>
        
        <div className="flex flex-col shrink-0">
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">AI Context / Roadblock</label>
          <textarea 
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Facing circular dependency in Auth service..."
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg indigo-glow mt-auto shrink-0 uppercase"
        >
          Add Sprint
        </button>
      </form>
    </>
  );
}
