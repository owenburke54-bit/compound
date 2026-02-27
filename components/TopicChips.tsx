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
    "h-9 px-4 text-sm rounded-full border transition-colors shrink-0 flex items-center justify-center";
  const chipActive =
    "bg-cyan-500 text-slate-900 border-transparent";
  const chipInactive =
    "bg-white/5 text-white/70 border-white/10 hover:bg-white/10";

  return (
    <div className="flex gap-3 overflow-x-auto -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/"
        className={`${chipBase} ${isActive(null) ? chipActive : chipInactive}`}
      >
        All
      </Link>
      <Link
        href={`/?topic=${INBOX_TOPIC_ID}`}
        className={`${chipBase} ${isActive(INBOX_TOPIC_ID) ? chipActive : chipInactive}`}
      >
        Inbox
      </Link>
      {pinnedTopics.map((t) => (
        <Link
          key={t.id}
          href={`/?topic=${t.id}`}
          className={`${chipBase} ${isActive(t.id) ? chipActive : chipInactive}`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
