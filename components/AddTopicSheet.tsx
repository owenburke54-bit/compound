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

interface AddTopicSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, category: string) => Promise<void>;
  existingCategories: string[];
}

export default function AddTopicSheet({
  isOpen,
  onClose,
  onSave,
  existingCategories,
}: AddTopicSheetProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategory("Uncategorized");
      setNewCategory("");
      setShowNewCategory(false);
    }
  }, [isOpen]);

  const categories = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories,
      ...(newCategory.trim() ? [newCategory.trim()] : []),
    ]),
  ];

  const effectiveCategory = showNewCategory ? newCategory.trim() || category : category;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed, effectiveCategory || "Uncategorized");
      setName("");
      setCategory("Uncategorized");
      setNewCategory("");
      setShowNewCategory(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 safe-area-pt">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onClose}
          className="text-slate-400 active:text-white text-sm py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Cancel
        </button>
        <span className="text-slate-300 font-medium">Add topic</span>
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="text-sky-400 active:text-sky-300 disabled:opacity-50 text-sm font-medium py-2 px-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {saving ? "..." : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="text-slate-400 text-sm block mb-2">Topic name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Books to Read"
            className="w-full px-4 py-3 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            autoFocus
          />
        </div>

        <div>
          <label className="text-slate-400 text-sm block mb-2">Category</label>
          {showNewCategory ? (
            <div className="space-y-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="w-full px-4 py-3 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategory("");
                }}
                className="text-slate-400 text-sm"
              >
                ← Choose existing
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewCategory(true)}
                className="text-sky-400 text-sm"
              >
                + Create new category
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
