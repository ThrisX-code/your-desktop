import React from 'react';
import { Task } from '../types';

interface MetricsProps {
  tasks: Task[];
}

export function Metrics({ tasks }: MetricsProps) {
  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 md:gap-0">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400 shrink-0">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold whitespace-nowrap">Total Focus Minutes</p>
            <p className="text-xl font-mono text-white leading-none mt-0.5">{totalMinutes}</p>
          </div>
        </div>
        <div className="h-px w-full md:w-px md:h-8 bg-slate-800 shrink-0"></div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold whitespace-nowrap">Sprint Completion</p>
            <p className="text-xl font-mono text-white leading-none mt-0.5">{completionPercentage}%</p>
          </div>
        </div>
        <div className="h-px w-full md:w-px md:h-8 bg-slate-800 shrink-0"></div>
        <div className="flex items-center space-x-3 w-full md:w-auto md:justify-end shrink-0">
          <div className="flex flex-col items-start md:items-end w-full md:min-w-[150px]">
            <p className="text-[10px] text-slate-500 uppercase font-bold whitespace-nowrap">Nexus Bandwidth</p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
