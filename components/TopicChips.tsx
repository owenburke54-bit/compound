"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import { INBOX_TOPIC_ID } from "@/lib/seed";

const MAX_PINNED = 6;

export default function TopicChips({
  activeTopicId,
}: {
  activeTopicId: string | undefined;
}) {
  const { topics, getTopicById } = useApp();
  const pinnedTopics = topics
    .filter((t) => t.pinned)
    .sort((a, b) => (a.pinnedOrder ?? 999) - (b.pinnedOrder ?? 999))
    .slice(0, MAX_PINNED);

  const isActive = (id: string | null) => {
    if (id === null) return activeTopicId === undefined;
    return activeTopicId === id;
  };

  const chipBase =
    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors";
  const chipActive =
    "bg-sky-500 text-white";
  const chipInactive =
    "bg-slate-700 text-slate-300 hover:bg-slate-600";

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/"
        className={`${chipBase} shrink-0 ${
          isActive(null) ? chipActive : chipInactive
        }`}
      >
        All
      </Link>
      <Link
        href={`/?topic=${INBOX_TOPIC_ID}`}
        className={`${chipBase} shrink-0 ${
          isActive(INBOX_TOPIC_ID) ? chipActive : chipInactive
        }`}
      >
        Inbox
      </Link>
      {pinnedTopics.map((t) => (
        <Link
          key={t.id}
          href={`/?topic=${t.id}`}
          className={`${chipBase} shrink-0 ${
            isActive(t.id) ? chipActive : chipInactive
          }`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
