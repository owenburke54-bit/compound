# Compound Roadmap V2: Idiot-Proof, Trust & Polish

Implementation plan for onboarding, trust features, and portfolio presentation.

---

## 1) First 30 Seconds Idiot-Proof

**Goal:** New users immediately understand what to do. Recruiters see a populated app.

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | First-run onboarding screen: “Compound is your personal knowledge base. Add a note, tag it, find it later.” + “Add your first note” button | New `OnboardingOverlay.tsx`, `lib/onboarding.ts` |
| 1.2 | Track first-run state (localStorage: `hasSeenOnboarding`) | `lib/onboarding.ts` |
| 1.3 | Empty states: Notes / Topics / Search guide the user (not just “No notes yet”) | `NoteList.tsx`, `TopicsManager.tsx`, `SearchView.tsx` |
| 1.4 | Demo note pack toggle (optional) for recruiters | Settings, `lib/seed.ts` (demo data), toggle in Settings |
| 1.5 | “Add your first note” button opens AddNoteSheet | OnboardingOverlay → trigger AddNoteSheet |

**Approach:** Show onboarding overlay on first load. Dismiss sets `hasSeenOnboarding`. Empty states include CTA text + button. Demo pack: add `loadDemoPack()` that inserts sample notes/topics; toggle in Settings.

---

## 2) Reduce Topic Overwhelm

**Goal:** Default to Inbox + 5–7 starters. Advanced topics hidden. Subtopics on tap.

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Seed: Inbox + 5–7 starter topics only (not 25) | `lib/seed.ts` |
| 2.2 | “Advanced” topics behind Add topic (user-controlled) | `lib/seed.ts` – define starter set vs extended set |
| 2.3 | Topics: show only top-level topics by default; reveal subtopics on tap | `TopicsManager.tsx` – collapse by default, tap to expand |

**Approach:** New seed: Inbox + 5–7 (e.g. Books, Movies, Ideas, Tasks, Quotes). Extended topics available via “Add topic” suggestions or manual add. Topics page: flat list, tap topic to expand into subtopics (if we add hierarchy) or keep flat for now.

---

## 3) Trust Features (Safety Net)

**Goal:** Users feel safe that their data is theirs.

| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Export: one-click JSON export | `lib/export.ts`, Settings / API |
| 3.2 | Optional CSV export | `lib/export.ts` |
| 3.3 | Backup: “Download backup file” (JSON blob) | Settings page |
| 3.4 | Privacy copy: “Stored locally in your browser. Nothing is uploaded.” | Settings page |

**Approach:** `exportToJson()` fetches notes + topics from IndexedDB, stringifies, triggers download. Same for CSV. Settings page with Export, Backup, Privacy copy.

---

## 4) Manual Organize Fallback

**Goal:** AI optional; manual move is fast and obvious.

| Task | Description | Files |
|------|-------------|-------|
| 4.1 | On note create: show suggested topic chip (if AI) + one-tap override | `AddNoteSheet.tsx` or post-save UI |
| 4.2 | Move to topic action in note card menu (3 dots) | `NoteList.tsx` – add menu to note row; `NoteDetailSheet` already has topic select |

**Approach:** Note cards: add ⋯ menu with “Move to topic…” → sheet/modal with topic list. Suggested topic chip: after save, show chip if AI suggested; tap to apply.

---

## 5) Mobile-First Polish

**Goal:** Layout never desktop-centers. Works on SE, Pixel, desktop narrow.

| Task | Description | Files |
|------|-------------|-------|
| 5.1 | Max-width rules: content full-width on mobile, optional max on desktop | `globals.css`, layout |
| 5.2 | Safe-area padding consistent | All pages |
| 5.3 | Test: iPhone SE (375px), Pixel (412px), desktop narrow (768px) | Manual QA |

**Approach:** Ensure `max-w-full` on main content; no `max-w-*` that creates centered column on mobile. `safe-area-inset-*` on FAB, nav, headers.

---

## 6) Portfolio Presentation

**Goal:** Settings page, README, screenshots, live link, portfolio summary.

| Task | Description | Files |
|------|-------------|-------|
| 6.1 | Settings page: Export, Reset data, Theme toggle (optional), About Compound | `app/settings/page.tsx` |
| 6.2 | Add Settings link to bottom nav or header | `BottomNav.tsx` or layout |
| 6.3 | README: project overview, setup, screenshots/GIF | `README.md` |
| 6.4 | Screenshots/GIF in repo (e.g. `/docs/screenshots/`) | Assets |
| 6.5 | Live link + 2–3 sentence summary for portfolio card | External (portfolio site) |

**Approach:** Settings page with sections: Export & Backup, Reset data, Theme (optional), About. README: clear description, install steps, 2–3 screenshots. Portfolio text: user writes separately.

---

## Suggested Implementation Order

| Priority | Focus |
|----------|-------|
| **1** | 1) Onboarding + empty states + demo pack |
| **2** | 6) Settings page (Export, Backup, Reset, Privacy, About) |
| **3** | 4) Note card “Move to topic” menu |
| **4** | 2) Seed: 5–7 starter topics |
| **5** | 5) Mobile polish check |
| **6** | README + screenshots |
