import { db, type Note } from "./db";
import { INBOX_TOPIC_ID } from "./seed";
import { generateId } from "./seed";

const DEMO_KEY = "compound_hasDemoPack";

const DEMO_NOTES: Omit<Note, "id">[] = [
  { text: "Re-read The Almanack of Naval Ravikant", topicId: "t11", createdAt: 0, updatedAt: 0 },
  { text: "Watch The Big Short", topicId: "t12", createdAt: 0, updatedAt: 0 },
  { text: "Build a habit of morning journaling", topicId: "t3", createdAt: 0, updatedAt: 0 },
  { text: "Explore compound interest visualization idea", topicId: "t7", createdAt: 0, updatedAt: 0 },
  { text: "Call mom this weekend", topicId: INBOX_TOPIC_ID, createdAt: 0, updatedAt: 0 },
  { text: "Meditation is the art of doing nothing", topicId: "t14", createdAt: 0, updatedAt: 0 },
];

export function getHasDemoPack(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "true";
}

export function setHasDemoPack(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(DEMO_KEY, "true");
  } else {
    localStorage.removeItem(DEMO_KEY);
  }
}

export async function loadDemoPack(): Promise<void> {
  const topics = await db.topics.toArray();
  const topicIds = new Set(topics.map((t) => t.id));

  const now = Date.now();
  const base = now - 7 * 24 * 60 * 60 * 1000; // 1 week ago

  for (let i = 0; i < DEMO_NOTES.length; i++) {
    const template = DEMO_NOTES[i];
    if (!topicIds.has(template.topicId)) continue;

    const ts = base + i * 24 * 60 * 60 * 1000;
    const note: Note = {
      ...template,
      id: generateId(),
      createdAt: ts,
      updatedAt: ts,
    };
    await db.notes.add(note);
  }

  setHasDemoPack(true);
}

export async function removeDemoPack(): Promise<void> {
  const demoNoteTexts = new Set(DEMO_NOTES.map((n) => n.text));
  const notes = await db.notes.toArray();
  for (const n of notes) {
    if (demoNoteTexts.has(n.text)) {
      await db.notes.delete(n.id);
    }
  }
  setHasDemoPack(false);
}
