import { db, type Note, type Topic } from "./db";

export interface ExportData {
  version: number;
  exportedAt: number;
  notes: Note[];
  topics: Topic[];
}

export async function exportToJson(): Promise<string> {
  const notes = await db.notes.toArray();
  const topics = await db.topics.toArray();
  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    notes,
    topics,
  };
  return JSON.stringify(data, null, 2);
}

export function downloadJson(content: string, filename = "compound-export.json") {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAndDownloadJson() {
  const content = await exportToJson();
  const date = new Date().toISOString().slice(0, 10);
  downloadJson(content, `compound-export-${date}.json`);
}

export function notesToCsv(notes: Note[]): string {
  const headers = ["id", "text", "topicId", "createdAt", "updatedAt", "tags"];
  const rows = notes.map((n) =>
    headers.map((h) => {
      const v = (n as unknown as Record<string, unknown>)[h];
      if (v === undefined) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export async function exportAndDownloadCsv() {
  const notes = await db.notes.toArray();
  const content = notesToCsv(notes);
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `compound-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
