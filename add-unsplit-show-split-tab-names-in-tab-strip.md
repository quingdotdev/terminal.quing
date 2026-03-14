# Add “Unsplit” + show split tab names in tab strip

## Summary
Implement a first-class **unsplit** action for split tabs (tabs containing multiple panes), and update the tab strip (“taskbar nav”) to show the **names of all panes** inside a split tab so users can always see both split tab names.

## Current State (from repo inspection)
- Split is implemented in `src/App.tsx` via `splitTab(projectId, targetTabId, sourceTabId?)`.
  - When `sourceTabId` is provided, panes from `sourceTab` are appended into `targetTab`, and `sourceTab` is deleted.
  - Panes currently only store `{ id, shell? }`, so the original tab names are lost after splitting.
- The tab strip currently renders only `t.title` and shows a split icon when `t.panes.length > 1`.

## Decisions (confirmed)
- **Unsplit behavior:** “One tab per pane” — keep first pane in current tab, create a new tab for each remaining pane.
- **Name display in tab strip:** show joined pane titles for split tabs.
- **Renaming split tab:** rename the **group tab** (not individual pane titles).

---

## Data Model Changes (public types in `src/App.tsx`)
1. Extend `Pane`:
   - Add `title?: string` (origin name for that pane; used for display + restoring on unsplit).

2. Keep `TerminalTab.title` as the **group title** (rename affects this only).

3. Add a small “display title” helper (derived at render time):
   - If `tab.panes.length === 1`: show `tab.title`.
   - If `tab.panes.length > 1`: show something like:
     - `"{tab.title} • {paneTitle1} | {paneTitle2} | ..."` (with truncation via existing `truncate` styling).

This satisfies:
- Group rename changes the left part (`tab.title`).
- The pane names remain visible (right part), meeting “see names of both split tabs”.

---

## Behavior Changes

### A) Preserve pane names during split
Update `splitTab(...)` so that whenever panes are created/merged:
- When creating a new pane (`+ create new pane`):
  - Copy `shell` from the last pane as today.
  - Set `pane.title` to something stable, e.g. the current tab title or the shell label (recommend: current tab title).
- When merging from an existing tab (`sourceTabId`):
  - Ensure every pane moved over has `title` populated:
    - Use existing `pane.title` if present.
    - Otherwise default to `sourceTab.title`.

### B) LocalStorage migration (backward compatibility)
When loading `projects` from localStorage in the existing initializer:
- For each tab:
  - For each pane:
    - If `pane.title` missing, set it to `tab.title` (or a shell label if `tab.title` is empty).

This prevents old saved workspaces from displaying blank pane names.

### C) Add “Unsplit” action
Add function `unsplitTab(projectId: string, tabId: string)`:
- Preconditions: tab exists and `tab.panes.length > 1`.
- Implementation:
  - Keep pane[0] in the existing tab; set its panes to `[pane0]`.
  - Set the existing tab’s title to `pane0.title ?? tab.title` (so the resulting single tab is named sensibly).
  - For each remaining pane i=1..n-1:
    - Create a new `TerminalTab` with:
      - `id`: new random id
      - `title`: `pane.title ?? "pane"`
      - `panes`: `[ { ...pane, id: newRandomPaneIdOrReuse } ]`
    - Insert these new tabs immediately to the right of the original tab (so the restore feels natural).
- UI entry point:
  - In the tab context menu (`contextMenu.type === 'tab'`), show:
    - **“Unsplit into tabs”** only when `tab.panes.length > 1`.

### D) Update tab strip rendering (taskbar nav)
In the tab strip map render:
- Replace the displayed `t.title` with a computed label:
  - `label = (t.panes.length > 1) ? "{t.title} • {joinedPaneTitles}" : t.title`
- `joinedPaneTitles` is built from `t.panes.map(p => p.title ?? t.title)` and de-duped if necessary.

---

## Files to Change
- `src/App.tsx`
  - Update `Pane` interface
  - Enhance localStorage load normalization
  - Update `splitTab` to persist pane titles
  - Add `unsplitTab`
  - Add context menu item
  - Update tab label rendering in the tab strip

(Expect no changes to `TerminalView` since it only needs `pane.id` and `pane.shell`.)

---

## Test Cases / Scenarios (manual acceptance)
1. **Split with existing tab**
   - Create two tabs: “powershell” and “bash”.
   - Split “powershell” with “bash”.
   - Expect tab strip label to show both names (e.g. `powershell • powershell | bash`).
2. **Unsplit restore**
   - From the split tab above, choose “Unsplit into tabs”.
   - Expect two tabs reappear, titled “powershell” and “bash”, each with one pane.
3. **Split + create new pane**
   - Split a tab via “+ create new pane”.
   - Expect the new pane name to appear in the joined list (not blank).
4. **Rename group title**
   - Rename a split tab to “workspace”.
   - Expect label like `workspace • powershell | bash` (pane names unchanged).
5. **Back-compat load**
   - Load a workspace saved before this change (no `pane.title` in localStorage).
   - Expect split tab strip labels to still show meaningful pane names (fallback to tab title).

---

## Assumptions / Defaults
- Pane names are sourced from `pane.title` (preferred), falling back to the owning `tab.title`.
- Unsplit keeps the first pane in-place and inserts restored tabs adjacent to the original tab for predictability.
- No notion of “active pane” is introduced in this iteration (so unsplit is deterministic and simple).
