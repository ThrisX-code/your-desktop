import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from '../lib/firebase';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Note {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  photoBase64: string | null;
  createdAt: number;
}

interface SprintNotesProps {
  task: Task;
  user: any;
}

export function SprintNotes({ task, user }: SprintNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!task || !user) return;

    const q = query(
      collection(db, 'notes'),
      where('taskId', '==', task.id),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      
      // Sort in memory since we are not creating an index on taskId + createdAt yet
      fetchedNotes.sort((a, b) => a.createdAt - b.createdAt);
      setNotes(fetchedNotes);
    }, (error) => {
      console.error("Notes snapshot error:", error);
    });

    return () => unsubscribe();
  }, [task, user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhoto(dataUrl);
        setError(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task) return;

    if (notes.length >= 15) {
      setError('Maximum of 15 notes reached for this sprint.');
      return;
    }

    if (text.length > 500) {
      setError(`Note text cannot exceed 500 characters. (Currently: ${text.length})`);
      return;
    }

    if (!text.trim() && !photo) {
      setError('Please add text or a photo.');
      return;
    }

    try {
      setIsUploading(true);
      await addDoc(collection(db, 'notes'), {
        taskId: task.id,
        userId: user.uid,
        text: text.trim(),
        photoBase64: photo,
        createdAt: Date.now()
      });
      setText('');
      setPhoto(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save note.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bento-card mt-4 flex flex-col gap-4">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-sm font-bold text-slate-400 uppercase">
          Sprint Notes ({notes.length}/15)
        </h2>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          {task.name}
        </span>
      </div>

      <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {notes.map(note => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 relative group"
            >
              <button
                onClick={() => handleDelete(note.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Note"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              {note.photoBase64 && (
                <img 
                  src={note.photoBase64} 
                  alt="Note Attachment" 
                  className="max-w-full h-auto rounded border border-slate-800 object-contain max-h-[300px]"
                />
              )}
              {note.text && (
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{note.text}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {notes.length === 0 && (
          <div className="text-center py-8 opacity-40 text-sm">
            No notes yet for this sprint.
          </div>
        )}
      </div>

      {notes.length < 15 && (
        <form onSubmit={handleAddNote} className="flex flex-col gap-3 mt-2 border-t border-slate-800 pt-4 shrink-0">
          {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              {photo ? 'Change Photo' : 'Upload Photo'}
            </button>
            {photo && (
              <div className="relative">
                <img src={photo} alt="Preview" className="h-10 w-10 object-cover rounded border border-slate-700" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add your notes here (max 500 characters)..."
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
            <span className="text-[10px] text-slate-500 self-end">
              {text.length} / 500 characters
            </span>
          </div>

          <button
            type="submit"
            disabled={isUploading || (!text.trim() && !photo)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-all shadow-lg text-sm uppercase tracking-wider"
          >
            {isUploading ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      )}
    </div>
  );
}
