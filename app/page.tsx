"use client";

import { useState } from "react";
import NoteList from "@/components/NoteList";
import AddNoteSheet from "@/components/AddNoteSheet";

export default function NotesPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-100">Notes</h1>
      </div>
      <NoteList showFileUnsorted />
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white text-2xl flex items-center justify-center shadow-lg hover:bg-sky-600 active:scale-95 transition-transform"
        aria-label="Add note"
      >
        +
      </button>
      <AddNoteSheet isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
