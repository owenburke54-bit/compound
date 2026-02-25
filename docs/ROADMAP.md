# Compound Roadmap: Making It Feel "Real"

Implementation plan for the 5-phase upgrade. Current state: capture via sheet, topics in nested categories, basic note detail, search with filters, background AI classification.

---

## Phase 1: Inbox-First Capture (Insanely Fast)

**Goal:** One-tap add, default to Inbox + recent, minimal friction.

### 1.1 One-tap add from anywhere

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 1.1.1 | Keep floating `+` FAB on Notes page (already exists) | `app/page.tsx` |
| 1.1.2 | Add global `+` FAB to layout so it’s visible on Topics and Search | `app/layout.tsx`, `BottomNav.tsx` |
| 1.1.3 | Consider a persistent quick-add bar (optional, post-MVP) | — |

**Approach:** Add a shared FAB or quick-add bar in `layout.tsx` that opens `AddNoteSheet` globally. Either render `AddNoteSheet` in layout and pass `isOpen`/`onClose` via context, or move the FAB into a layout-level component that triggers a shared sheet.

### 1.2 Default view = Inbox + recent notes

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 1.2.1 | Default Notes view shows Inbox notes first, then recent (all notes, newest first) | `NoteList.tsx`, `app/page.tsx` |
| 1.2.2 | Visual separation: "Inbox" section (unfiled) vs "Recent" section | `NoteList.tsx` |
| 1.2.3 | Optional: Inbox badge/count in header | `app/page.tsx` |

**Approach:** Notes page already shows all notes when `?topic` is absent. Enhance `NoteList` to group: (1) Inbox notes first, (2) then remaining notes by `createdAt` descending. Add subtle section headers.

### 1.3 Quick types (optional)

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 1.3.1 | Add `type` to Note: `"note" | "idea" | "task" | "link" | "quote" | "reminder"` | `lib/db.ts` |
| 1.3.2 | DB migration: add `type` column, default `"note"` | `lib/db.ts` (new version) |
| 1.3.3 | AddNoteSheet: optional chip/button row for quick type selection | `AddNoteSheet.tsx` |
| 1.3.4 | Display type icon/label in note list (optional, minimal) | `NoteList.tsx` |

**Approach:** Add `type?: string` to `Note`, default `"note"`. Add version 2 to CompoundDB. UI: small chip row in AddNoteSheet; list can show a tiny icon if desired.

### 1.4 Auto-add metadata silently

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 1.4.1 | `createdAt`, `updatedAt` already exist | — |
| 1.4.2 | Add `source?: "typed" | "pasted"` (infer from input) | `lib/db.ts`, `context.addNote` |
| 1.4.3 | Tags: already have `tags?: string[]`; AI or manual later | — |

**Approach:** On paste, set `source: "pasted"`; otherwise `source: "typed"`. No UI for source; used for analytics/UX later.

---

## Phase 2: Topics Overhaul (Clean & Simple)

**Goal:** Pinned topics as chips on Notes; Topics page = Search + Pinned + All (flat) + Create.

### 2.1 Schema & data

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 2.1.1 | Add `Topic.pinned?: boolean` and `Topic.pinnedOrder?: number` | `lib/db.ts` |
| 2.1.2 | DB migration: new version | `lib/db.ts` |
| 2.1.3 | Context: `updateTopic` for pin/unpin; max 6 pinned | `lib/context.tsx` |
| 2.1.4 | Seed: optionally pin 0–2 topics by default | `lib/seed.ts` (optional) |

### 2.2 Notes page: pinned topic chips

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 2.2.1 | Fetch pinned topics (max 6), sorted by `pinnedOrder` | `lib/context.tsx` or helper |
| 2.2.2 | Render chip row below header: Inbox + pinned topics | `app/page.tsx` or `NoteList.tsx` |
| 2.2.3 | Tap chip → filter notes by topic (reuse existing `?topic=` flow) | `app/page.tsx` |
| 2.2.4 | "All topics" chip → clear filter, show Inbox + recent | `app/page.tsx` |

**Approach:** `app/page.tsx` reads `?topic=` for filtering. Add a chip row: "All" | "Inbox" | pinned topics. Each chip links to `/?topic=id` or `/?` for All.

### 2.3 Topics page redesign

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 2.3.1 | Replace `TopicsManager` with new layout: Search, Pinned, All (flat), Create | `app/topics/page.tsx`, new `TopicsPageRedesign.tsx` or refactor |
| 2.3.2 | Search: same behavior, flat list of matching topics | Reuse search logic |
| 2.3.3 | Pinned section: list pinned topics, tap to unpin or reorder | New component |
| 2.3.4 | All topics: flat list (no category headers) | Remove `byCategory`, `DEFAULT_CATEGORIES` usage |
| 2.3.5 | Long-press topic → Pin / Unpin / Edit / Delete / View notes | `TopicActionsMenu`-like |
| 2.3.6 | Remove category dropdown from Add Topic (or make optional) | `AddTopicSheet.tsx` |

**Approach:** New Topics page structure: search bar → Pinned (flat) → All topics (flat). Remove expand/collapse by category. Keep `Topic.category` in DB for future use but hide from UI. Deprecate `MoveTopicSheet`, `topicsPrefs` collapse state.

### 2.4 Migration from current TopicsManager

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 2.4.1 | Migrate `TopicsManager` usage to new component | `app/topics/page.tsx` |
| 2.4.2 | Remove or archive: `MoveTopicSheet`, `getCollapsedCategories`, `setCollapsedCategories` | `lib/topicsPrefs.ts` (can remove) |
| 2.4.3 | Simplify `AddTopicSheet`: name only, category optional/hidden | `AddTopicSheet.tsx` |

---

## Phase 3: Premium Note Detail View

**Goal:** Tap note → full detail page with edit, topic, tags, pin, remind date.

### 3.1 Dedicated note detail route (optional)

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 3.1.1 | Option A: Keep `NoteDetailSheet` (slide-up modal) | Current |
| 3.1.2 | Option B: Add `/note/[id]` route for full-page detail | `app/note/[id]/page.tsx` |

**Recommendation:** Keep sheet for now; full page can come later if needed.

### 3.2 Note detail enhancements

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 3.2.1 | Edit text (already exists) | `NoteDetailSheet.tsx` |
| 3.2.2 | Change topic (already exists) | `NoteDetailSheet.tsx` |
| 3.2.3 | Add tags: tag input + tag chips | `NoteDetailSheet.tsx`, `Note.tags` |
| 3.2.4 | Pin/favorite: add `Note.pinned?: boolean` | `lib/db.ts`, `NoteDetailSheet` |
| 3.2.5 | Remind me: add `Note.remindAt?: number` | `lib/db.ts`, date picker in detail |
| 3.2.6 | Improve layout: section headers, spacing, visual hierarchy | `NoteDetailSheet.tsx` |

**Approach:** Add `pinned`, `remindAt` to Note schema. DB version bump. Detail sheet: sections for Text, Topic, Tags, Pin, Remind. Tags: simple input + chip list. Remind: native date input or small date picker.

### 3.3 Display pinned/remind in list

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 3.3.1 | Show pin icon on pinned notes in list | `NoteList.tsx` |
| 3.3.2 | Show "Remind: date" if `remindAt` set | `NoteList.tsx` |

---

## Phase 4: Powerful Search

**Goal:** Global search, filter chips, recent/saved searches.

### 4.1 Global search UX

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 4.1.1 | Search across note text, tags, topic names | `SearchView.tsx` |
| 4.1.2 | Already have topic filter; ensure it works with empty query | Done (recent fix) |
| 4.1.3 | Show relevance/recency: sort by match strength or date | `SearchView` logic |

### 4.2 Filter chips

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 4.2.1 | Replace topic dropdown with chips: Topic, Date, Pinned | `SearchView.tsx` |
| 4.2.2 | Topic chips: All + top N topics | `SearchView` |
| 4.2.3 | Date filter: Today, This week, This month, Custom | `SearchView` |
| 4.2.4 | Pinned filter: All, Pinned only | `SearchView` |

### 4.3 Recent searches

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 4.3.1 | Store last 5–10 search queries in localStorage | `lib/searchPrefs.ts` or similar |
| 4.3.2 | When search input focused + empty, show recent searches | `SearchView` |
| 4.3.3 | Tap recent → populate query, run search | `SearchView` |

### 4.4 Saved searches (lightweight)

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 4.4.1 | Allow "Save this search" (query + filters) | `SearchView` |
| 4.4.2 | Store in IndexedDB or localStorage | New table or `localStorage` |
| 4.4.3 | Show saved searches as shortcuts | `SearchView` |

---

## Phase 5: AI as Optional Layer

**Goal:** Keep app great without AI; AI suggests topic + tags in background.

### 5.1 Current state

| Item | Status |
|------|--------|
| `classifyAndApply` | Exists, background, fire-and-forget |
| Toast on success | "Filed under X" |
| Failure | Silent |
| "Try filing again" | Exists for Inbox |

### 5.2 Enhancements (low priority until Phases 1–4 done)

| Task | Description | Files / Notes |
|------|-------------|---------------|
| 5.2.1 | AI suggests tags in addition to topic | `api/classify/route.ts`, `lib/classify.ts` |
| 5.2.2 | Optional: user setting to disable AI | `lib/settings.ts` or context |
| 5.2.3 | Ensure AI never blocks: save first, classify after | Already done |

---

## Suggested Implementation Order

| Week / Sprint | Focus |
|---------------|-------|
| **1** | Phase 1.1 (global FAB), 1.2 (Inbox + recent grouping) |
| **2** | Phase 2.1–2.2 (pinned schema + chips on Notes page) |
| **3** | Phase 2.3–2.4 (Topics page redesign) |
| **4** | Phase 3 (Note detail: tags, pin, remind) |
| **5** | Phase 4.1–4.2 (Search filter chips) |
| **6** | Phase 4.3–4.4 (Recent/saved searches) |

Phase 5 can run in parallel or after; it's already functional.

---

## DB Schema Summary (Changes)

| Table | New Fields |
|-------|------------|
| `topics` | `pinned?: boolean`, `pinnedOrder?: number` |
| `notes` | `type?: string`, `source?: "typed"\|"pasted"`, `pinned?: boolean`, `remindAt?: number` (tags exist) |

---

## Files to Create

- `lib/searchPrefs.ts` – recent/saved search storage
- `lib/settings.ts` – optional user prefs (AI on/off)
- `components/TopicChips.tsx` – pinned chips for Notes page
- `components/TopicsPageRedesign.tsx` – new Topics layout (or refactor `TopicsManager`)

## Files to Modify (High-Level)

- `lib/db.ts` – schema versions, new fields
- `lib/context.tsx` – pinned topics, addNote source
- `app/page.tsx` – chip row, global FAB wiring
- `app/layout.tsx` – global AddNoteSheet + FAB
- `app/topics/page.tsx` – new Topics layout
- `components/NoteList.tsx` – Inbox/recent sections, pin/remind display
- `components/AddNoteSheet.tsx` – quick types, optional
- `components/NoteDetailSheet.tsx` – tags, pin, remind
- `components/SearchView.tsx` – filter chips, recent searches
- `components/TopicsManager.tsx` – replace or heavily refactor

## Files to Remove / Deprecate

- `lib/topicsPrefs.ts` – collapse state (if Topics no longer use categories)
- `MoveTopicSheet` – if category move is removed
- Category logic in `TopicsManager` – replaced by flat list
