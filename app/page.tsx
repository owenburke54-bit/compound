"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NoteList from "@/components/NoteList";
import { useApp } from "@/lib/context";
import Link from "next/link";
import TopicChips from "@/components/TopicChips";

function NotesContent() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topic") ?? undefined;
  const { getTopicById } = useApp();
  const topic = topicId ? getTopicById(topicId) : null;

  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 pt-3">
        <div className="flex items-center gap-2 pb-3">
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
        <TopicChips activeTopicId={topicId} />
      </div>
      <NoteList
        filterTopicId={topicId}
        showFileUnsorted={!topicId}
      />
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
