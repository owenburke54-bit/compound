import { db } from "./db";
import { INBOX_TOPIC_ID } from "./seed";

const CONFIDENCE_THRESHOLD = 0.7;

export type ClassifyCallbacks = {
  onSuccess: (topicName: string) => void;
  onNotesRefreshed: () => Promise<void>;
  onError?: (message?: string) => void;
};

/**
 * Classifies a note in the background. Fire-and-forget.
 * - On success: updates note topic, refreshes, shows "Filed under X" toast.
 * - On failure: does nothing visible; logs to console in dev.
 */
export async function classifyAndApply(
  noteId: string,
  callbacks: ClassifyCallbacks
): Promise<void> {
  const { onSuccess, onNotesRefreshed, onError } = callbacks;

  const note = await db.notes.get(noteId);
  if (!note || !navigator.onLine) return;

  const allTopics = await db.topics.toArray();
  const topicsForApi = allTopics
    .filter((t) => t.id !== INBOX_TOPIC_ID)
    .map((t) => ({ id: t.id, name: t.name, category: t.category }));

  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: note.text,
        topics: topicsForApi,
        inboxTopicId: INBOX_TOPIC_ID,
      }),
    });

    const rawText = await res.text();

    if (!res.ok) {
      let message = "Sorting failed";
      try {
        const err = JSON.parse(rawText) as { error?: string; debugId?: string };
        message = err.error || message;
      } catch {
        // ignore
      }
      if (process.env.NODE_ENV === "development") {
        console.warn("[classify] failed:", rawText.slice(0, 200));
      }
      onError?.(message);
      return;
    }

    let result: { topicId: string; confidence: number; tags: string[] };
    try {
      result = JSON.parse(rawText) as {
        topicId: string;
        confidence: number;
        tags: string[];
      };
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("[classify] invalid JSON response");
      }
      onError?.("Sorting failed — invalid response");
      return;
    }

    // Guard: note might have been deleted
    const currentNote = await db.notes.get(noteId);
    if (!currentNote) return;

    const topic = allTopics.find((t) => t.id === result.topicId);
    const confidence = Math.max(0, Math.min(1, result.confidence ?? 0));

    if (confidence >= CONFIDENCE_THRESHOLD && topic && topic.id !== INBOX_TOPIC_ID) {
      await db.notes.update(noteId, {
        topicId: result.topicId,
        suggestedTopicId: undefined,
        confidence: undefined,
        tags: result.tags?.length ? result.tags : undefined,
        unfiledOffline: false,
        updatedAt: Date.now(),
      });
      await onNotesRefreshed();
      onSuccess(topic.name);
    } else if (topic) {
      await db.notes.update(noteId, {
        suggestedTopicId: result.topicId,
        confidence,
        tags: result.tags?.length ? result.tags : undefined,
        unfiledOffline: false,
        updatedAt: Date.now(),
      });
      await onNotesRefreshed();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sorting failed";
    if (process.env.NODE_ENV === "development") {
      console.warn("[classify] error:", msg);
    }
    onError?.("Sorting failed — try again");
  }
}
