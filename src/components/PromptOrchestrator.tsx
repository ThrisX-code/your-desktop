import React, { useState } from 'react';
import { Task } from '../types';

interface PromptOrchestratorProps {
  task: Task | null;
}

export function PromptOrchestrator({ task }: PromptOrchestratorProps) {
  const [copied, setCopied] = useState(false);

  const promptText = task ? `Act as an elite technical co-pilot. I am currently running a ${task.duration}-minute sprint for the task: '${task.name}' under the ${task.category} track. My current core focus or roadblock is: '${task.context}'. Please break this down into a laser-focused micro-roadmap, provide the primary logical architecture, and warn me about common edge-case errors to avoid.` : '';

  const handleCopy = async () => {
    if (!task) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = promptText;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">AI Orchestrator</h2>
        <button 
          onClick={handleCopy}
          disabled={!task}
          className={`text-[10px] px-3 py-1 rounded border transition-colors uppercase font-bold
            ${copied 
              ? 'bg-slate-800 border-slate-700 text-emerald-400' 
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 disabled:opacity-50 disabled:hover:bg-slate-800'
            }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      
      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 font-mono text-xs leading-relaxed text-slate-300">
        {!task ? (
          <p className="opacity-40 italic">Select a task from the timeline to generate the AI micro-roadmap prompt...</p>
        ) : (
          <>
            <span className="text-indigo-400 font-bold mb-2 block">PROMPT_LOADED:</span>
            {promptText}
          </>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 shrink-0 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Model Engine</p>
          <p className="text-xs font-bold text-slate-400">GPT-4o-TURBO / NEURAL-CORE-9</p>
        </div>
        <div className="flex flex-col items-end justify-end">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-2">Connectors</p>
          <div className="flex gap-2">
            <a 
              href="https://notebooklm.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded transition-colors flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path></svg>
              NotebookLM
            </a>
            <a 
              href="https://gemini.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded transition-colors flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Gemini
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
