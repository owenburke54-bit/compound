"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useApp } from "@/lib/context";
import type { Topic } from "@/lib/db";
import { INBOX_TOPIC_ID } from "@/lib/seed";
import { getCollapsedCategories, setCollapsedCategories } from "@/lib/topicsPrefs";
import AddTopicSheet from "./AddTopicSheet";
import MoveTopicSheet from "./MoveTopicSheet";
import TopicActionsMenu from "./TopicActionsMenu";

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

function useLongPress(
  onLongPress: () => void,
  onClick: () => void,
  ms = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const start = useCallback(() => {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, ms);
  }, [onLongPress, ms]);

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const click = useCallback(() => {
    end();
    if (!didLongPress.current) onClick();
  }, [onClick, end]);

  return { onTouchStart: start, onTouchEnd: end, onClick: click };
}

interface TopicsManagerProps {
  showAddTopic?: boolean;
  onAddTopicClose?: () => void;
}

export default function TopicsManager({
  showAddTopic = false,
  onAddTopicClose = () => {},
}: TopicsManagerProps) {
  const { topics, addTopic, updateTopic, deleteTopic } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuTopicId, setMenuTopicId] = useState<string | null>(null);
  const [movingTopic, setMovingTopic] = useState<Topic | null>(null);

  // Load persisted collapse state once on mount (default: all collapsed)
  const hasLoadedPrefs = useRef(false);
  useEffect(() => {
    if (hasLoadedPrefs.current) return;
    hasLoadedPrefs.current = true;
    const stored = getCollapsedCategories();
    const allCats = new Set([
      ...DEFAULT_CATEGORIES,
      ...topics.map((t) => t.category || "Uncategorized"),
    ]);
    if (stored.length > 0) {
      setExpandedCategories(
        new Set([...allCats].filter((c) => !stored.includes(c)))
      );
    }
  }, [topics]);

  const persistCollapsed = useCallback((expanded: Set<string>) => {
    const allCats = new Set([
      ...DEFAULT_CATEGORIES,
      ...topics.map((t) => t.category || "Uncategorized"),
    ]);
    const collapsed = [...allCats].filter((c) => !expanded.has(c));
    setCollapsedCategories(collapsed);
  }, [topics]);

  const byCategory = useMemo(() => {
    const acc: Record<string, Topic[]> = {};
    for (const t of topics) {
      const cat = t.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
    }
    return acc;
  }, [topics]);

  const allCategories = useMemo(
    () => [
      ...DEFAULT_CATEGORIES.filter((c) => byCategory[c]?.length),
      ...Object.keys(byCategory).filter((c) => !DEFAULT_CATEGORIES.includes(c)),
    ],
    [byCategory]
  );

  const { filteredBySearch, categoriesToShow, topicMatchesQuery } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        filteredBySearch: byCategory,
        categoriesToShow: allCategories,
        topicMatchesQuery: () => true,
      };
    }
    const matching: Record<string, Topic[]> = {};
    const catsToShow = new Set<string>();
    for (const [cat, items] of Object.entries(byCategory)) {
      const filtered = items.filter((t) =>
        t.name.toLowerCase().includes(q)
      );
      if (filtered.length > 0) {
        matching[cat] = filtered;
        catsToShow.add(cat);
      }
    }
    return {
      filteredBySearch: matching,
      categoriesToShow: allCategories.filter((c) => catsToShow.has(c)),
      topicMatchesQuery: (t: Topic) => t.name.toLowerCase().includes(q),
    };
  }, [searchQuery, byCategory, allCategories]);

  const toggleCategory = useCallback(
    (cat: string) => {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        persistCollapsed(next);
        return next;
      });
    },
    [persistCollapsed]
  );

  const expandAll = useCallback(() => {
    const all = new Set(Object.keys(filteredBySearch));
    setExpandedCategories(all);
    persistCollapsed(all);
  }, [filteredBySearch, persistCollapsed]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
    persistCollapsed(new Set());
  }, [persistCollapsed]);

  // When search is active, auto-expand categories that have matches
  useEffect(() => {
    if (searchQuery.trim() && categoriesToShow.length > 0) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        categoriesToShow.forEach((c) => next.add(c));
        return next;
      });
    }
  }, [searchQuery, categoriesToShow]);

  const startEdit = (t: Topic) => {
    setEditingId(t.id);
    setEditName(t.name);
    setMenuTopicId(null);
  };

  const saveEdit = async () => {
    if (editingId && editName.trim()) {
      await updateTopic(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === INBOX_TOPIC_ID) return;
    if (confirm("Delete this topic? Notes will move to Inbox.")) {
      await deleteTopic(id);
      setMenuTopicId(null);
    }
  };

  const handleAdd = async (name: string, category: string) => {
    await addTopic(name, category);
  };

  const existingCategories = useMemo(
    () => [...new Set(topics.map((t) => t.category || "Uncategorized"))],
    [topics]
  );

  return (
    <div className="pb-20">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics…"
          className="w-full px-4 py-2.5 bg-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={expandAll}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Category cards */}
      <div className="p-4 space-y-4">
        {categoriesToShow.map((cat) => {
          const items = filteredBySearch[cat] ?? [];
          const isExpanded = expandedCategories.has(cat);

          return (
            <div
              key={cat}
              className="rounded-xl border border-slate-700/80 bg-slate-800/40 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/60 transition-colors"
              >
                <span className="font-semibold text-slate-100 text-base">
                  {cat}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700 rounded-md text-slate-400 text-xs">
                    {items.length}
                  </span>
                  <span
                    className={`text-slate-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-700/60 divide-y divide-slate-700/40">
                  {items.map((t) => (
                    <TopicRow
                      key={t.id}
                      topic={t}
                      isInbox={t.id === INBOX_TOPIC_ID}
                      isEditing={editingId === t.id}
                      editName={editName}
                      setEditName={setEditName}
                      onSaveEdit={saveEdit}
                      onStartEdit={startEdit}
                      onMenuToggle={() =>
                        setMenuTopicId(menuTopicId === t.id ? null : t.id)
                      }
                      menuOpen={menuTopicId === t.id}
                      onMenuClose={() => setMenuTopicId(null)}
                      isHighlighted={
                        !!searchQuery.trim() && topicMatchesQuery(t)
                      }
                      onRename={() => startEdit(t)}
                      onDelete={() => handleDelete(t.id)}
                      onMoveCategory={() => {
                        setMovingTopic(t);
                        setMenuTopicId(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categoriesToShow.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          {searchQuery.trim() ? "No topics match your search." : "No topics yet."}
        </div>
      )}

      <AddTopicSheet
        isOpen={showAddTopic}
        onClose={onAddTopicClose}
        onSave={handleAdd}
        existingCategories={existingCategories}
      />

      <MoveTopicSheet
        topic={movingTopic}
        isOpen={!!movingTopic}
        onClose={() => setMovingTopic(null)}
        onMove={async (id, newCat) => {
          await updateTopic(id, { category: newCat });
        }}
        existingCategories={existingCategories}
      />
    </div>
  );
}

interface TopicRowProps {
  topic: Topic;
  isInbox: boolean;
  isEditing: boolean;
  editName: string;
  setEditName: (v: string) => void;
  onSaveEdit: () => void;
  onStartEdit: (t: Topic) => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  menuOpen: boolean;
  isHighlighted: boolean;
  onRename: () => void;
  onDelete: () => void;
  onMoveCategory: () => void;
}

function TopicRow({
  topic,
  isInbox,
  isEditing,
  editName,
  setEditName,
  onSaveEdit,
  onStartEdit,
  onMenuToggle,
  onMenuClose,
  menuOpen,
  isHighlighted,
  onRename,
  onDelete,
  onMoveCategory,
}: TopicRowProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const longPress = useLongPress(
    () => !isInbox && onMenuToggle(),
    () => {},
    400
  );

  return (
    <div
      ref={anchorRef}
      className="relative flex items-center pl-6 pr-2 py-2 min-h-[44px] group"
      {...(isInbox ? {} : longPress)}
    >
      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit();
          }}
          className="flex-1 px-3 py-1.5 bg-slate-800 rounded text-white text-sm"
          autoFocus
        />
      ) : (
        <>
          <span
            onClick={() => !isInbox && onStartEdit(topic)}
            className={`flex-1 text-sm ${
              isHighlighted ? "text-sky-300 font-medium" : "text-slate-300"
            }`}
          >
            {topic.name}
          </span>
          {isInbox ? (
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span>🔒</span>
              <span>Required</span>
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle();
              }}
              className="p-2 text-slate-500 hover:text-slate-300 rounded"
              aria-label="Actions"
            >
              ⋯
            </button>
          )}
          {menuOpen && (
            <TopicActionsMenu
              topic={topic}
              isOpen={menuOpen}
              onClose={onMenuClose}
              anchorRef={anchorRef}
              onRename={onRename}
              onDelete={onDelete}
              onMoveCategory={onMoveCategory}
              isInbox={isInbox}
            />
          )}
        </>
      )}
    </div>
  );
}
