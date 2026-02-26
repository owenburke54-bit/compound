"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { db, type Note, type Topic } from "./db";
import { classifyAndApply } from "./classify";
import { getAiSortingEnabled } from "./aiSettings";
import { INBOX_TOPIC_ID, generateId, seedIfEmpty } from "./seed";

type ToastMessage = { id: string; text: string };

interface AppContextValue {
  topics: Topic[];
  notes: Note[];
  isLoading: boolean;
  toast: (text: string) => void;
  refreshTopics: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  addNote: (text: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTopic: (name: string, category: string) => Promise<Topic>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  classifyNote: (noteId: string) => void;
  fileUnsortedNotes: () => Promise<void>;
  getTopicById: (id: string) => Topic | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const refreshTopics = useCallback(async () => {
    const list = await db.topics.orderBy("category").toArray();
    setTopics(list);
  }, []);

  const refreshNotes = useCallback(async () => {
    const list = await db.notes.orderBy("createdAt").reverse().toArray();
    setNotes(list);
  }, []);

  const getTopicById = useCallback(
    (id: string) => topics.find((t) => t.id === id),
    [topics]
  );

  const addNote = useCallback(
    async (text: string): Promise<Note> => {
      const now = Date.now();
      const note: Note = {
        id: generateId(),
        text: text.trim(),
        topicId: INBOX_TOPIC_ID,
        createdAt: now,
        updatedAt: now,
        unfiledOffline: !navigator.onLine,
      };
      await db.notes.add(note);
      await refreshNotes();
      return note;
    },
    [refreshNotes]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      const toUpdate = { ...updates, updatedAt: Date.now() };
      await db.notes.update(id, toUpdate);
      await refreshNotes();
    },
    [refreshNotes]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await db.notes.delete(id);
      await refreshNotes();
    },
    [refreshNotes]
  );

  const addTopic = useCallback(
    async (name: string, category: string): Promise<Topic> => {
      const now = Date.now();
      const topic: Topic = {
        id: generateId(),
        name: name.trim(),
        category: category.trim() || "Uncategorized",
        createdAt: now,
        updatedAt: now,
      };
      await db.topics.add(topic);
      await refreshTopics();
      return topic;
    },
    [refreshTopics]
  );

  const updateTopic = useCallback(
    async (id: string, updates: Partial<Topic>) => {
      const toUpdate = { ...updates, updatedAt: Date.now() };
      await db.topics.update(id, toUpdate);
      await refreshTopics();
    },
    [refreshTopics]
  );

  const deleteTopic = useCallback(
    async (id: string) => {
      const inbox = await db.topics.get(INBOX_TOPIC_ID);
      if (!inbox || id === INBOX_TOPIC_ID) return;

      const notesInTopic = await db.notes.where("topicId").equals(id).toArray();
      for (const n of notesInTopic) {
        await db.notes.update(n.id, { topicId: INBOX_TOPIC_ID, updatedAt: Date.now() });
      }
      await db.topics.delete(id);
      await refreshTopics();
      await refreshNotes();
    },
    [refreshTopics, refreshNotes]
  );

  const classifyNote = useCallback(
    (noteId: string) => {
      void classifyAndApply(noteId, {
        onSuccess: (topicName) => toast(`Filed under ${topicName}`),
        onNotesRefreshed: refreshNotes,
        onError: (msg) => toast(msg || "Sorting failed"),
      });
    },
    [refreshNotes, toast]
  );

  const fileUnsortedNotes = useCallback(async () => {
    if (!navigator.onLine) {
      toast("Offline — connect to file notes");
      return;
    }

    const inboxNotes = await db.notes
      .where("topicId")
      .equals(INBOX_TOPIC_ID)
      .sortBy("createdAt");

    const toProcess = inboxNotes.reverse().slice(0, 10);
    if (toProcess.length === 0) return;

    toast("Sorting…");
    for (const note of toProcess) {
      classifyNote(note.id);
    }
  }, [classifyNote, toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await seedIfEmpty();
      if (mounted) {
        await refreshTopics();
        await refreshNotes();
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshTopics, refreshNotes]);

  // Auto-retry classification when back online
  useEffect(() => {
    const handleOnline = () => {
      if (getAiSortingEnabled()) {
        fileUnsortedNotes();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [fileUnsortedNotes]);

  const value: AppContextValue = {
    topics,
    notes,
    isLoading,
    toast,
    refreshTopics,
    refreshNotes,
    addNote,
    updateNote,
    deleteNote,
    addTopic,
    updateTopic,
    deleteTopic,
    classifyNote,
    fileUnsortedNotes,
    getTopicById,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

