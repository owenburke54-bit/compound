"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import type { Note } from "@/lib/db";

interface NoteDetailSheetProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteDetailSheet({
  note,
  isOpen,
  onClose,
}: NoteDetailSheetProps) {
  const [text, setText] = useState("");
  const [topicId, setTopicId] = useState("");
  const { updateNote, deleteNote, topics, getTopicById } = useApp();

  useEffect(() => {
    if (note) {
      setText(note.text);
      setTopicId(note.topicId);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const suggestedTopic = note.suggestedTopicId
    ? getTopicById(note.suggestedTopicId)
    : null;
  const topicOptions = topics;

  const handleSave = async () => {
    await updateNote(note.id, { text: text.trim(), topicId });
    onClose();
  };

  const handleApplySuggestion = async () => {
    if (suggestedTopic) {
      await updateNote(note.id, {
        topicId: suggestedTopic.id,
        suggestedTopicId: undefined,
        confidence: undefined,
      });
      onClose();
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this note?")) {
      await deleteNote(note.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 safe-area-pt">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 safe-area-pt">
        <button
          onClick={onClose}
          className="text-slate-400 active:text-white text-sm py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">Edit Note</span>
        <button
          onClick={handleSave}
          className="text-sky-400 active:text-sky-300 text-sm font-medium py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[120px] p-3 bg-slate-800 rounded-lg text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 text-base"
          placeholder="Note text..."
        />

        {suggestedTopic && (
          <div className="mt-4">
            <p className="text-slate-400 text-sm mb-2">Suggested:</p>
            <button
              onClick={handleApplySuggestion}
              className="px-4 py-2.5 bg-sky-600/30 text-sky-400 rounded-full text-sm active:bg-sky-600/50 min-h-[44px]"
            >
              {suggestedTopic.name}
            </button>
          </div>
        )}

        <div className="mt-4">
          <label className="text-slate-400 text-sm block mb-2">Topic</label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full p-3 bg-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[44px] text-base"
          >
            {topicOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDelete}
          className="mt-6 text-red-400 active:text-red-300 text-sm py-2 px-2 min-h-[44px]"
        >
          Delete note
        </button>
      </div>
    </div>
  );
}

