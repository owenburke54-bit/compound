"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import type { Topic } from "@/lib/db";
import { INBOX_TOPIC_ID } from "@/lib/seed";

const CATEGORIES = [
  "Core",
  "Personal Development",
  "Ideas & Creation",
  "Consumption",
  "Life Logistics",
  "Relationships & Conversations",
  "Strategic / Long-Term",
  "Uncategorized",
];

export default function TopicsManager() {
  const { topics, addTopic, updateTopic, deleteTopic } = useApp();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("Uncategorized");

  const byCategory = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    const cat = t.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const orderedCategories = [
    ...CATEGORIES.filter((c) => byCategory[c]?.length),
    ...Object.keys(byCategory).filter((c) => !CATEGORIES.includes(c)),
  ];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const startEdit = (t: Topic) => {
    setEditingId(t.id);
    setEditName(t.name);
  };

  const saveEdit = async () => {
    if (editingId && editName.trim()) {
      await updateTopic(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
    }
  };

  const handleAdd = async () => {
    if (addName.trim()) {
      await addTopic(addName.trim(), addCategory);
      setAddName("");
      setAddCategory("Uncategorized");
      setShowAdd(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === INBOX_TOPIC_ID) return;
    if (confirm("Delete this topic? Notes will move to Inbox.")) {
      await deleteTopic(id);
    }
  };

  return (
    <div className="pb-20">
      {orderedCategories.map((cat) => {
        const items = byCategory[cat] ?? [];
        const isExpanded = expandedCategories.has(cat);

        return (
          <div key={cat} className="border-b border-slate-800">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30"
            >
              <span className="font-medium text-slate-200">{cat}</span>
              <span className="text-slate-500 text-sm">{items.length}</span>
            </button>

            {isExpanded && (
              <ul className="pb-2">
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-2 px-4 py-2 group"
                  >
                    {editingId === t.id ? (
                      <>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                          }}
                          className="flex-1 px-2 py-1 bg-slate-800 rounded text-white text-sm"
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <span
                          onClick={() => startEdit(t)}
                          className="flex-1 text-slate-300 text-sm"
                        >
                          {t.name}
                        </span>
                        {t.id !== INBOX_TOPIC_ID && (
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 text-xs px-2"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {showAdd ? (
        <div className="p-4 border-t border-slate-800 space-y-3">
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Topic name"
            className="w-full px-4 py-2 bg-slate-800 rounded-lg text-white placeholder-slate-500"
          />
          <select
            value={addCategory}
            onChange={(e) => setAddCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 rounded-lg text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!addName.trim()}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setAddName("");
              }}
              className="px-4 py-2 text-slate-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-2 px-4 border border-slate-600 text-slate-400 rounded-lg text-sm hover:border-sky-500 hover:text-sky-400"
          >
            + Add topic
          </button>
        </div>
      )}
    </div>
  );
}

