"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import type { Note } from "@/lib/db";
import { INBOX_TOPIC_ID } from "@/lib/seed";
import NoteDetailSheet from "./NoteDetailSheet";

interface NoteListProps {
  filterTopicId?: string;
  showFileUnsorted?: boolean;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString();
}

export default function NoteList({
  filterTopicId,
  showFileUnsorted = false,
}: NoteListProps) {
  const { notes, getTopicById, fileUnsortedNotes, updateNote } = useApp();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered =
    filterTopicId !== undefined
      ? notes.filter((n) => n.topicId === filterTopicId)
      : notes;

  const unfiledCount = notes.filter(
    (n) => n.topicId === INBOX_TOPIC_ID && n.unfiledOffline === true
  ).length;

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setDetailOpen(true);
  };

  return (
    <div className="pb-20">
      {showFileUnsorted && unfiledCount > 0 && navigator.onLine && (
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={fileUnsortedNotes}
            className="w-full py-2 px-4 bg-sky-600/30 text-sky-400 rounded-lg text-sm font-medium hover:bg-sky-600/50"
          >
            File {unfiledCount} unsorted note{unfiledCount !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      <ul className="divide-y divide-slate-800">
        {filtered.map((note) => {
          const topic = getTopicById(note.topicId);
          return (
            <li
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="p-4 active:bg-slate-800/50 cursor-pointer"
            >
              <p className="text-slate-200 line-clamp-2">{note.text}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                  {topic?.name ?? "Unknown"}
                </span>
                {note.unfiledOffline && (
                  <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 rounded text-xs">
                    Unfiled (offline)
                  </span>
                )}
                {note.suggestedTopicId && !note.unfiledOffline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const suggested = getTopicById(note.suggestedTopicId!);
                      if (suggested) {
                        updateNote(note.id, {
                          topicId: suggested.id,
                          suggestedTopicId: undefined,
                          confidence: undefined,
                        });
                      }
                    }}
                    className="px-2 py-0.5 bg-sky-900/50 text-sky-400 rounded text-xs hover:bg-sky-900/70"
                  >
                    Suggested: {getTopicById(note.suggestedTopicId)?.name}
                  </button>
                )}
                <span className="text-slate-500 text-xs ml-auto">
                  {formatDate(note.createdAt)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          No notes yet. Tap + to add one.
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

