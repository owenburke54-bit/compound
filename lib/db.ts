import Dexie, { type Table } from "dexie";

export interface Topic {
  id: string;
  name: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  isInbox?: boolean;
}

export interface Note {
  id: string;
  text: string;
  topicId: string;
  createdAt: number;
  updatedAt: number;
  suggestedTopicId?: string;
  confidence?: number;
  tags?: string[];
  unfiledOffline?: boolean;
}

export class CompoundDB extends Dexie {
  topics!: Table<Topic, string>;
  notes!: Table<Note, string>;

  constructor() {
    super("CompoundDB");
    this.version(1).stores({
      topics: "id, category, createdAt, isInbox",
      notes: "id, topicId, createdAt, updatedAt, unfiledOffline",
    });
  }
}

export const db = new CompoundDB();

