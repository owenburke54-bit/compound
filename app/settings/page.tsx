"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { exportAndDownloadJson, exportAndDownloadCsv } from "@/lib/export";
import { getAiSortingEnabled, setAiSortingEnabled } from "@/lib/aiSettings";
import { db } from "@/lib/db";
import Link from "next/link";

export default function SettingsPage() {
  const { refreshNotes, refreshTopics, toast, getTopicById } = useApp();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAiEnabled(getAiSortingEnabled());
  }, []);

  const handleExportJson = async () => {
    try {
      const filename = await exportAndDownloadJson();
      toast(`Downloaded ${filename}`);
    } catch {
      toast("Export failed");
    }
  };

  const handleExportCsv = async () => {
    try {
      const filename = await exportAndDownloadCsv((id) => getTopicById(id)?.name);
      toast(`Downloaded ${filename}`);
    } catch {
      toast("Export failed");
    }
  };

  const handleResetData = async () => {
    if (!confirm("Delete all notes and topics? This cannot be undone.")) return;
    setLoading(true);
    try {
      await db.notes.clear();
      await db.topics.clear();
      await refreshNotes();
      await refreshTopics();
      toast("Data reset. Reload to reseed.");
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      toast("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-2">
        <Link href="/" className="text-slate-400 hover:text-white text-sm">
          ←
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">Settings</h1>
      </div>

      <div className="p-4 pb-20 space-y-8">
        {/* Export & Backup */}
        <section>
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            Export & Backup
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleExportJson}
              className="w-full py-3 px-4 bg-slate-800 rounded-xl text-slate-200 text-sm text-left hover:bg-slate-700"
            >
              Download backup (JSON)
            </button>
            <button
              onClick={handleExportCsv}
              className="w-full py-3 px-4 bg-slate-800 rounded-xl text-slate-200 text-sm text-left hover:bg-slate-700"
            >
              Export notes (CSV)
            </button>
          </div>
        </section>

        {/* AI sorting */}
        <section>
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            AI
          </h2>
          <div className="flex items-center justify-between py-3 px-4 bg-slate-800 rounded-xl">
            <div>
              <p className="text-slate-200 text-sm font-medium">
                AI topic sorting
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Suggests topics when you add notes (uses OpenAI)
              </p>
            </div>
            <button
              onClick={() => {
                const next = !aiEnabled;
                setAiSortingEnabled(next);
                setAiEnabled(next);
                toast(next ? "AI sorting on" : "AI sorting off");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                aiEnabled
                  ? "bg-sky-600/30 text-sky-400"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {aiEnabled ? "On" : "Off"}
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            AI only runs when enabled. Notes are stored locally.
          </p>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            Privacy
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed py-2 px-4 bg-slate-800/50 rounded-xl">
            Stored locally in your browser. Nothing is uploaded.
          </p>
        </section>

        {/* About */}
        <section>
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            About Compound
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed py-2">
            Local-first personal knowledge base. Add notes, tag them with topics,
            find them later. AI sorting is optional. Built with Next.js + IndexedDB
            + OpenAI.
          </p>
        </section>

        {/* Reset */}
        <section>
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            Danger zone
          </h2>
          <button
            onClick={handleResetData}
            disabled={loading}
            className="w-full py-3 px-4 bg-red-900/30 rounded-xl text-red-400 text-sm hover:bg-red-900/50 disabled:opacity-50"
          >
            Reset all data
          </button>
        </section>
      </div>
    </>
  );
}
