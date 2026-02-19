"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { INBOX_TOPIC_ID } from "@/lib/seed";

interface AddNoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNoteSheet({ isOpen, onClose }: AddNoteSheetProps) {
  const [text, setText] = useState("");
  const { addNote, classifyNote } = useApp();

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const note = await addNote(trimmed);
    setText("");
    onClose();

    if (navigator.onLine) {
      classifyNote(note.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 safe-area-pt">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 safe-area-pt">
        <button
          onClick={onClose}
          className="text-slate-400 active:text-white text-sm py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">New Note</span>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="text-sky-400 active:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Save
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your thought..."
        className="flex-1 p-4 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-base safe-area-pb"
        autoFocus
      />
    </div>
  );
}

