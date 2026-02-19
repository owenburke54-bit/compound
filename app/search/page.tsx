"use client";

import SearchView from "@/components/SearchView";

export default function SearchPage() {
  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-100">Search</h1>
      </div>
      <SearchView />
    </>
  );
}

