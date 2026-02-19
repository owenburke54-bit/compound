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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-sm"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">Edit Note</span>
        <button
          onClick={handleSave}
          className="text-sky-400 hover:text-sky-300 text-sm font-medium"
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[120px] p-3 bg-slate-800 rounded-lg text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="Note text..."
        />

        {suggestedTopic && (
          <div className="mt-4">
            <p className="text-slate-400 text-sm mb-2">Suggested:</p>
            <button
              onClick={handleApplySuggestion}
              className="px-3 py-1.5 bg-sky-600/30 text-sky-400 rounded-full text-sm hover:bg-sky-600/50"
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
            className="w-full p-3 bg-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
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
          className="mt-6 text-red-400 hover:text-red-300 text-sm"
        >
          Delete note
        </button>
      </div>
    </div>
  );
}

