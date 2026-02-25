"use client";

import { useState, useEffect } from "react";
import { getHasSeenOnboarding, setHasSeenOnboarding } from "@/lib/onboarding";
import { useAddNote } from "@/lib/addNoteContext";

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false);
  const { openAddNote } = useAddNote();

  useEffect(() => {
    if (!getHasSeenOnboarding()) {
      setShow(true);
    }
  }, []);

  const handleAddFirst = () => {
    setHasSeenOnboarding();
    setShow(false);
    openAddNote();
  };

  const handleDismiss = () => {
    setHasSeenOnboarding();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 p-6 safe-area-pb safe-area-pt">
      <div className="max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold text-slate-100">
          Compound is your personal knowledge base.
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Add a note, tag it, find it later.
        </p>
        <div className="space-y-3 pt-4">
          <button
            onClick={handleAddFirst}
            className="w-full py-4 px-6 rounded-xl bg-sky-500 text-white font-medium text-base hover:bg-sky-600 active:scale-[0.98] transition-transform"
          >
            Add your first note
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-3 text-slate-500 text-sm hover:text-slate-400"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
