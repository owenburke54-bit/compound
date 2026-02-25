"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface AddNoteContextValue {
  openAddNote: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddNoteContext = createContext<AddNoteContextValue | null>(null);

export function AddNoteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openAddNote = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  return (
    <AddNoteContext.Provider value={{ openAddNote, isOpen, onClose }}>
      {children}
    </AddNoteContext.Provider>
  );
}

export function useAddNote() {
  const ctx = useContext(AddNoteContext);
  if (!ctx) throw new Error("useAddNote must be used within AddNoteProvider");
  return ctx;
}
