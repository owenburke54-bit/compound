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

export async function exportAndDownloadJson(): Promise<string> {
  const content = await exportToJson();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `compound-backup-${date}.json`;
  downloadJson(content, filename);
  return filename;
}

export async function notesToCsv(notes: Note[], getTopicName: (id: string) => string | undefined): Promise<string> {
  const headers = ["id", "text", "topic", "createdAt"];
  const rows = notes.map((n) => {
    const topicName = getTopicName(n.topicId) ?? n.topicId;
    const values = [n.id, n.text, topicName, new Date(n.createdAt).toISOString()];
    return values.map((v) => {
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export async function exportAndDownloadCsv(
  getTopicName: (id: string) => string | undefined
): Promise<string> {
  const notes = await db.notes.toArray();
  const content = await notesToCsv(notes, getTopicName);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `compound-backup-${date}.csv`;
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return filename;
}
