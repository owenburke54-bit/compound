"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/context";
import type { Note } from "@/lib/db";
import NoteDetailSheet from "./NoteDetailSheet";

export default function SearchView() {
  const { notes, topics, getTopicById } = useApp();
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    let filtered = notes.filter((n) =>
      n.text.toLowerCase().includes(q)
    );

    if (topicFilter) {
      filtered = filtered.filter((n) => n.topicId === topicFilter);
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [notes, query, topicFilter]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setDetailOpen(true);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-slate-900 z-10 p-4 space-y-3 border-b border-slate-800">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-4 py-3 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoFocus
        />
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 rounded-lg text-white"
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="divide-y divide-slate-800">
        {results.map((note) => {
          const topic = getTopicById(note.topicId);
          return (
            <li
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="p-4 active:bg-slate-800/50 cursor-pointer"
            >
              <p className="text-slate-200 line-clamp-2">{note.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                  {topic?.name ?? "Unknown"}
                </span>
                <span className="text-slate-500 text-xs">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          {query.trim() ? "No matching notes." : "Type to search."}
        </div>
      )}

      <NoteDetailSheet
        note={selectedNote}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedNote(null);
        }}
      />
    </div>
  );
}

