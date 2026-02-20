"use client";

import { useState, useEffect } from "react";
import type { Topic } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  "Core",
  "Personal Development",
  "Ideas & Creation",
  "Consumption",
  "Life Logistics",
  "Relationships & Conversations",
  "Strategic / Long-Term",
  "Uncategorized",
];

interface MoveTopicSheetProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (topicId: string, newCategory: string) => Promise<void>;
  existingCategories: string[];
}

export default function MoveTopicSheet({
  topic,
  isOpen,
  onClose,
  onMove,
  existingCategories,
}: MoveTopicSheetProps) {
  const [category, setCategory] = useState(topic?.category ?? "Uncategorized");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topic) setCategory(topic.category ?? "Uncategorized");
  }, [topic?.id, topic?.category]);

  const categories = [
    ...new Set([...DEFAULT_CATEGORIES, ...existingCategories]),
  ].filter((c) => c !== (topic?.category ?? ""));

  const handleMove = async () => {
    if (!topic || !category.trim()) return;
    setSaving(true);
    try {
      await onMove(topic.id, category.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !topic) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900 safe-area-pt">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onClose}
          className="text-slate-400 active:text-white text-sm py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">Move &quot;{topic.name}&quot;</span>
        <button
          onClick={handleMove}
          disabled={!category.trim() || category === topic.category || saving}
          className="text-sky-400 active:text-sky-300 disabled:opacity-50 text-sm font-medium py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {saving ? "..." : "Move"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <label className="text-slate-400 text-sm block mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value={topic.category}>{topic.category}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
