"use client";

import { useEffect, useRef } from "react";
import type { Topic } from "@/lib/db";

interface TopicActionsMenuProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null> | null;
  onRename: () => void;
  onDelete: () => void;
  onMoveCategory: () => void;
  isInbox: boolean;
}

export default function TopicActionsMenu({
  topic,
  isOpen,
  onClose,
  anchorRef,
  onRename,
  onDelete,
  onMoveCategory,
  isInbox,
}: TopicActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = menuRef.current?.contains(target);
      const inAnchor = anchorRef?.current?.contains(target);
      if (!inMenu && !inAnchor) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 min-w-[180px] py-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
    >
      {!isInbox && (
        <>
          <button
            onClick={() => {
              onRename();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onMoveCategory();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
          >
            Move to category…
          </button>
          <div className="border-t border-slate-600 my-1" />
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700"
          >
            Delete
          </button>
        </>
      )}
      {isInbox && (
        <div className="px-4 py-2 text-sm text-slate-500">
          Inbox cannot be edited
        </div>
      )}
    </div>
  );
}
