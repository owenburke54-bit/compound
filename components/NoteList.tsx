"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { useAddNote } from "@/lib/addNoteContext";
import { getAiSortingEnabled } from "@/lib/aiSettings";
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

interface NoteRowProps {
  note: Note;
  topic: { name: string } | undefined;
  getTopicById: (id: string) => { name: string } | undefined;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  formatDate: (ts: number) => string;
  classifyNote?: (id: string) => void;
  isInbox?: boolean;
}

const topicChipClass =
  "inline-flex items-center h-7 px-3 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-slate-400";

function NoteRow({ note, topic, getTopicById, updateNote, formatDate, classifyNote, isInbox }: NoteRowProps) {
  return (
    <>
      <p className="text-slate-200 line-clamp-2">{note.text}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={topicChipClass}>
          {topic?.name ?? "Unknown"}
        </span>
        {note.unfiledOffline && (
          <span className={`${topicChipClass} border-amber-500/30 bg-amber-900/20 text-amber-400`}>
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
                  topicId: note.suggestedTopicId!,
                  suggestedTopicId: undefined,
                  confidence: undefined,
                });
              }
            }}
            className={`${topicChipClass} border-sky-500/30 bg-sky-900/30 text-sky-400 hover:bg-sky-900/50`}
          >
            Suggested: {getTopicById(note.suggestedTopicId!)?.name}
          </button>
        )}
        {isInbox && classifyNote && getAiSortingEnabled() && navigator.onLine && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              classifyNote(note.id);
            }}
            className={`${topicChipClass} hover:bg-white/10`}
          >
            Retry sort
          </button>
        )}
        <span className="text-slate-500 text-xs ml-auto">
          {formatDate(note.createdAt)}
        </span>
      </div>
    </>
  );
}

export default function NoteList({
  filterTopicId,
  showFileUnsorted = false,
}: NoteListProps) {
  const { notes, getTopicById, fileUnsortedNotes, updateNote, classifyNote } = useApp();
  const { openAddNote } = useAddNote();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered =
    filterTopicId !== undefined
      ? notes.filter((n) => n.topicId === filterTopicId)
      : notes;

  const inboxNotes = notes.filter((n) => n.topicId === INBOX_TOPIC_ID);
  const recentNotes = notes.filter((n) => n.topicId !== INBOX_TOPIC_ID);
  const inboxCount = inboxNotes.length;
  const showInboxRecent =
    filterTopicId === undefined && (inboxNotes.length > 0 || recentNotes.length > 0);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setDetailOpen(true);
  };

  return (
    <div className="pb-20">
      {showFileUnsorted && inboxCount > 0 && navigator.onLine && getAiSortingEnabled() && (
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={fileUnsortedNotes}
            title="Uses AI to suggest topics for Inbox notes. Optional — you can always file manually."
            className="w-full py-2 px-4 bg-sky-600/30 text-sky-400 rounded-lg text-sm font-medium hover:bg-sky-600/50"
          >
            Sort {inboxCount} note{inboxCount !== 1 ? "s" : ""} with AI
          </button>
          <p className="text-slate-500 text-xs mt-1.5">
            Optional. Suggests topics for Inbox notes.
          </p>
        </div>
      )}

      <ul className="divide-y divide-slate-800">
        {showInboxRecent ? (
          <>
            {inboxNotes.length > 0 && (
              <>
                <li className="px-4 py-2.5 text-slate-500 text-xs font-medium uppercase tracking-wider sticky top-12 z-[1] bg-slate-900/95 backdrop-blur border-b border-slate-800">
                  Inbox
                </li>
                {inboxNotes.map((note) => {
                  const topic = getTopicById(note.topicId);
                  return (
                    <li
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="p-4 active:bg-slate-800/50 cursor-pointer"
                    >
                      <NoteRow
                        note={note}
                        topic={topic}
                        getTopicById={getTopicById}
                        updateNote={updateNote}
                        formatDate={formatDate}
                        classifyNote={classifyNote}
                        isInbox
                      />
                    </li>
                  );
                })}
              </>
            )}
            {recentNotes.length > 0 && (
              <>
                <li className="px-4 py-2.5 text-slate-500 text-xs font-medium uppercase tracking-wider sticky top-12 z-[1] bg-slate-900/95 backdrop-blur border-b border-slate-800">
                  Recent
                </li>
                {recentNotes.map((note) => {
                  const topic = getTopicById(note.topicId);
                  return (
                    <li
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="p-4 active:bg-slate-800/50 cursor-pointer"
                    >
                      <NoteRow
                        note={note}
                        topic={topic}
                        getTopicById={getTopicById}
                        updateNote={updateNote}
                        formatDate={formatDate}
                      />
                    </li>
                  );
                })}
              </>
            )}
          </>
        ) : (
          filtered.map((note) => {
            const topic = getTopicById(note.topicId);
            return (
              <li
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="p-4 active:bg-slate-800/50 cursor-pointer"
              >
                <NoteRow
                  note={note}
                  topic={topic}
                  getTopicById={getTopicById}
                  updateNote={updateNote}
                  formatDate={formatDate}
                />
              </li>
            );
          })
        )}
      </ul>

      {filtered.length === 0 && (
        <div className="p-8 text-center space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            {filterTopicId
              ? "No notes in this topic yet."
              : "Add your first thought."}
          </p>
          {!filterTopicId && (
            <p className="text-slate-500 text-xs">
              Try: &quot;Watch Wedding Crashers&quot;
            </p>
          )}
          <button
            onClick={openAddNote}
            className="py-3 px-6 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 active:scale-[0.98]"
          >
            {filterTopicId ? "Add a note" : "Add your first thought"}
          </button>
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

