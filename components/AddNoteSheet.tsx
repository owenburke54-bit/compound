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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-sm"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">New Note</span>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Save
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your thought..."
        className="flex-1 p-4 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-base"
        autoFocus
      />
    </div>
  );
}

