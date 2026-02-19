import { db, type Topic } from "./db";

const INBOX_ID = "inbox";

const DEFAULT_TOPICS: Omit<Topic, "createdAt" | "updatedAt">[] = [
  { id: INBOX_ID, name: "Inbox", category: "Core", isInbox: true },
  { id: "t1", name: "Things I Want to Learn", category: "Personal Development" },
  { id: "t2", name: "Skills to Develop", category: "Personal Development" },
  { id: "t3", name: "Habits to Build", category: "Personal Development" },
  { id: "t4", name: "Weaknesses to Improve", category: "Personal Development" },
  { id: "t5", name: "Experiments to Run", category: "Personal Development" },
  { id: "t6", name: "Questions I'm Thinking About", category: "Personal Development" },
  { id: "t7", name: "Startup Ideas", category: "Ideas & Creation" },
  { id: "t8", name: "Products/Solutions", category: "Ideas & Creation" },
  { id: "t9", name: "Side Projects", category: "Ideas & Creation" },
  { id: "t10", name: "Improvements to Existing Projects", category: "Ideas & Creation" },
  { id: "t11", name: "Books to Read", category: "Consumption" },
  { id: "t12", name: "Movies to Watch", category: "Consumption" },
  { id: "t13", name: "Articles to Revisit", category: "Consumption" },
  { id: "t14", name: "Quotes Worth Keeping", category: "Consumption" },
  { id: "t15", name: "Travel Ideas", category: "Life Logistics" },
  { id: "t16", name: "Places I've Been", category: "Life Logistics" },
  { id: "t17", name: "Future Purchases", category: "Life Logistics" },
  { id: "t18", name: "Conversation Takeaways", category: "Relationships & Conversations" },
  { id: "t19", name: "Advice I Received", category: "Relationships & Conversations" },
  { id: "t20", name: "Lessons from Mentors", category: "Relationships & Conversations" },
  { id: "t21", name: "Career Strategy", category: "Strategic / Long-Term" },
  { id: "t22", name: "Investment Philosophy", category: "Strategic / Long-Term" },
  { id: "t23", name: "Life Design", category: "Strategic / Long-Term" },
  { id: "t24", name: "Values", category: "Strategic / Long-Term" },
  { id: "t25", name: "Long-Term Bets", category: "Strategic / Long-Term" },
];

export const INBOX_TOPIC_ID = INBOX_ID;

export async function seedIfEmpty(): Promise<boolean> {
  const count = await db.topics.count();
  if (count > 0) return false;

  const now = Date.now();
  const topics: Topic[] = DEFAULT_TOPICS.map((t) => ({
    ...t,
    createdAt: now,
    updatedAt: now,
  }));

  await db.topics.bulkAdd(topics);
  return true;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

