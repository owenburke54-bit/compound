"use client";

import { useState } from "react";
import AddNoteSheet from "./AddNoteSheet";

export default function AddNoteFAB() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-16 h-16 rounded-full bg-sky-500 text-white text-3xl flex items-center justify-center shadow-xl hover:bg-sky-600 active:scale-95 transition-transform touch-manipulation"
        style={{
          bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Add note"
      >
        +
      </button>
      <AddNoteSheet isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
