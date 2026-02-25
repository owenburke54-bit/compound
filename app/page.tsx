"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NoteList from "@/components/NoteList";
import AddNoteSheet from "@/components/AddNoteSheet";
import { useApp } from "@/lib/context";
import Link from "next/link";

function NotesContent() {
  const [addOpen, setAddOpen] = useState(false);
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topic");
  const { getTopicById } = useApp();
  const topic = topicId ? getTopicById(topicId) : null;

  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-2">
        {topic ? (
          <>
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              ←
            </Link>
            <h1 className="text-lg font-semibold text-slate-100">{topic.name}</h1>
          </>
        ) : (
          <h1 className="text-lg font-semibold text-slate-100">Notes</h1>
        )}
      </div>
      <NoteList
        filterTopicId={topicId ?? undefined}
        showFileUnsorted={!topicId}
      />
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-16 h-16 rounded-full bg-sky-500 text-white text-3xl flex items-center justify-center shadow-xl hover:bg-sky-600 active:scale-95 transition-transform touch-manipulation"
        style={{
          bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Add note"
      >
        +
      </button>
      <AddNoteSheet isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-100">Notes</h1>
      </div>
    }>
      <NotesContent />
    </Suspense>
  );
}
