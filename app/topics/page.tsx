"use client";

import { useState } from "react";
import TopicsManager from "@/components/TopicsManager";

export default function TopicsPage() {
  const [addTopicOpen, setAddTopicOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Topics</h1>
        <button
          onClick={() => setAddTopicOpen(true)}
          className="text-sky-400 text-sm font-medium"
        >
          Add topic
        </button>
      </div>
      <TopicsManager
        showAddTopic={addTopicOpen}
        onAddTopicClose={() => setAddTopicOpen(false)}
      />
    </>
  );
}

