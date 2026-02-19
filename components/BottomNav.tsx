"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Notes", icon: "📝" },
  { href: "/topics", label: "Topics", icon: "📁" },
  { href: "/search", label: "Search", icon: "🔍" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-700 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map(({ href, label, icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive ? "text-sky-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

