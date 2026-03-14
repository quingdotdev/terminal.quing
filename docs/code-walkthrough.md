# code walkthrough

this is a page by page overview of the code in version 0.0.1. each section follows file order so you can map behavior to implementation without guessing.

## src/App.tsx

this file is the main renderer and owns workspace state, commands, and layout. the table tracks every major block in order.

| order | block | explanation |
| --- | --- | --- |
| 1 | imports | loads react hooks, lucide icons, local components, and workspace helpers used throughout the file |
| 2 | `cn` helper | merges class names with `clsx` and `tailwind-merge` to avoid duplicated classes |
| 3 | `PRESET_COLORS` | defines the tab color palette shown in the context menu |
| 4 | `randomId` | creates a short random id for projects, tabs, and panes |
| 5 | `initialWorkspace` | reads local storage through `loadWorkspace` before the component renders |
| 6 | core state | sets `projects`, `profiles`, `activeProjectId`, `activeTabId`, `currentView`, and `theme` from storage |
| 7 | menu state | tracks shell menu, context menu, and submenu visibility |
| 8 | sidebar state | tracks collapsed and hover states for the sidebar |
| 9 | palette state | tracks palette visibility, search text, and selection index |
| 10 | editing state | tracks which project or tab is being renamed and the input value |
| 11 | onboarding state | controls the welcome tour visibility and step index |
| 12 | view utilities | tracks compact tabs, search bar visibility, activity dots, and pane size cache |
| 13 | drag state | keeps the current dragged tab id for reordering |
| 14 | refs | stores terminal apis and dom refs for menus, palettes, and the pane container |
| 15 | resize ref | stores resize interaction state while the user drags a handle |
| 16 | `quickProfiles` | caches the first three profiles to map Ctrl+Shift+1..3 |
| 17 | persistence effect | writes workspace state to local storage when core state changes |
| 18 | theme effect | applies `data-theme` to the document root to switch styles |
| 19 | active derivation | computes active project, active tab, active pane id, and active pane |
| 20 | `getProfileById` | resolves a profile by id with fallback to defaults |
| 21 | `resolvePaneConfig` | computes shell, args, and cwd for a pane using profile fallbacks |
| 22 | `setActiveTab` | marks a tab active, clears activity dots, and ensures terminal view |
| 23 | `activatePane` | sets the active pane and focuses it in xterm when requested |
| 24 | `addTab` | creates a new tab and single pane using a selected profile |
| 25 | `splitTab` | adds a pane to a tab or merges panes from another tab and normalizes sizes |
| 26 | `unsplitTab` | converts panes into separate tabs and reassigns ids |
| 27 | `moveTab` | moves a tab left or right within its project |
| 28 | `reorderTabs` | drag and drop reorder helper that splices tabs by id |
| 29 | `setTabColor` | sets tab color and mirrors it to panes when a tab is single pane |
| 30 | `removeTab` | removes a tab and reassigns active tab if needed |
| 31 | `removePane` | removes a pane and collapses the tab when it becomes empty |
| 32 | `removeProject` | deletes a project and reassigns active project and tab |
| 33 | `duplicateTab` | clones a tab and all panes with new ids |
| 34 | `addProject` | creates a new project with a single tab and pane |
| 35 | `startRenaming` | begins inline editing by setting id and initial value |
| 36 | `handleRenameProject` | applies a new project name and exits edit mode |
| 37 | `handleRenameTab` | applies a new tab name and mirrors it to a single pane |
| 38 | `handleContextMenu` | opens the right click menu and resets submenu state |
| 39 | `completeOnboarding` | marks the welcome tour as completed in local storage |
| 40 | `resetState` | clears local storage and restores the normalized default workspace |
| 41 | `updateProfile` | updates shell, args, or cwd for a profile in settings |
| 42 | `exportWorkspace` | serializes the workspace to json and downloads a file |
| 43 | `handleImport` | reads a json file, normalizes it, and replaces state |
| 44 | `handleActivity` | sets activity dots when background panes produce output |
| 45 | `handleCopy` | copies selection from the active terminal to the system clipboard |
| 46 | `handlePaste` | reads clipboard text and pastes it into the active terminal |
| 47 | `handleSelectAll` | selects all text in the active terminal |
| 48 | `toggleTheme` | rotates `light`, `dark`, and `dusk` themes |
| 49 | `openFind` | opens the terminal search bar and clears the query |
| 50 | `focusNextPane` | moves focus to the next pane in the active tab |
| 51 | `focusPrevPane` | moves focus to the previous pane in the active tab |
| 52 | `runFindNext` | runs search forward in the active terminal |
| 53 | `runFindPrev` | runs search backward in the active terminal |
| 54 | `closeFind` | clears search state and closes the search bar |
| 55 | `startResize` | begins a pane resize drag and stores initial sizes |
| 56 | `handleResizeMove` | recalculates adjacent pane sizes with a minimum width guard |
| 57 | `handleResizeEnd` | clears resize state and restores the cursor |
| 58 | resize listeners | wires mouse move and mouse up handlers for dragging |
| 59 | palette focus effect | focuses the palette input when the palette opens |
| 60 | click outside effect | closes the shell menu and context menu when clicking elsewhere |
| 61 | compact tabs layout | switches to compact mode when the tab strip overflows |
| 62 | active id sync | ensures active project and tab remain valid after deletes |
| 63 | keyboard shortcuts | handles global shortcuts for palette, search, tabs, panes, and profiles |
| 64 | `onboardingSteps` | defines the welcome tour content and icons |
| 65 | `paletteActions` | builds the command palette list based on profiles and state |
| 66 | `runPaletteAction` | executes a palette action by index |
| 67 | `getSplitTitleParts` | extracts per pane titles and colors for split tabs |
| 68 | `renderTabLabel` | renders tab labels for split tabs with truncation logic |
| 69 | root layout | sets the main flex layout and global colors |
| 70 | onboarding modal | renders the welcome tour overlay and step controls |
| 71 | context menu | renders the right click menu with split and color submenus |
| 72 | command palette | renders the palette modal with searchable actions |
| 73 | sidebar | renders projects, collapse toggle, and project actions |
| 74 | tab strip | renders tabs with drag reordering and activity dots |
| 75 | shell menu | renders profile shortcuts and entry points to settings and palette |
| 76 | window controls | renders minimize, maximize, and close buttons |
| 77 | pane surface | renders all panes and keeps inactive panes mounted |
| 78 | terminal mapping | creates `TerminalView` for each pane and wires callbacks |
| 79 | settings view | renders profile editor, theme controls, and workspace tools |
| 80 | status bar | renders `StatusBar` with project, tab, and terminal details |

## src/components/TerminalView.tsx

this file owns the xterm instance and the pty lifecycle. it is the boundary between the renderer and the main process.

| order | block | explanation |
| --- | --- | --- |
| 1 | imports | loads react hooks, xterm, the fit and search addons, and theme tokens |
| 2 | `TerminalApi` | defines the interface used by App for focus, copy, paste, and search |
| 3 | `TerminalViewProps` | defines the inputs required to create and manage a terminal pane |
| 4 | refs | stores the dom node, the xterm instance, and the fit addon |
| 5 | visibility effect | fits and resizes the terminal when a hidden pane becomes visible |
| 6 | theme effect | updates xterm colors when the app theme changes |
| 7 | terminal setup | creates the xterm instance, loads addons, and mounts it |
| 8 | api creation | exposes focus, selection, paste, and search methods to the parent |
| 9 | `onReady` | registers the api in App once the xterm instance exists |
| 10 | terminal init | requests a pty from the main process and wires data callbacks |
| 11 | data flow | writes pty output to xterm and forwards user input to the pty |
| 12 | initial resize | resizes the pty to match the xterm rows and cols |
| 13 | resize handler | resizes the pty only when the pane is visible |
| 14 | `ResizeObserver` | triggers resize logic when the container changes size |
| 15 | window resize | reuses the resize handler for window level changes |
| 16 | cleanup | removes listeners, kills the pty, disposes xterm, and releases api |
| 17 | focus effect | focuses the terminal when the pane becomes active |
| 18 | render | returns the container div with theme based background |

## src/components/StatusBar.tsx

this file renders a single line status bar. it is pure and stateless. props flow in, markup flows out. it displays project, tab, profile, cwd, size, and a connection indicator based on `isConnected`.

## src/components/TerminalSearchBar.tsx

this file renders the search bar used by the terminal find feature. it focuses the input on mount and maps enter to next, escape to close, and the arrow buttons to navigation callbacks. it does not touch state directly and only uses props provided by App.

## src/state/workspace.ts

| block | purpose |
| --- | --- |
| constants | defines the storage key and version |
| default profiles | seeds the initial profile set |
| normalization | sanitizes workspace input and fills missing fields |
| migration | reads legacy keys and converts them into the v2 shape |
| load function | reads local storage with defensive parsing |
| save function | writes the workspace with quota safety |

## src/state/types.ts

this file defines the core types for profiles, panes, tabs, projects, and the workspace container.

## src/state/themes.ts

this file defines theme names, label mapping, and the xterm color palette for light, dark, and dusk.

## src/index.css

this file defines slate theme variables, resizer styles, active pane highlighting, and general layout tokens. it also contains typography and motion defaults.

## electron/main.js

| block | purpose |
| --- | --- |
| window creation | creates the electron window and sets the icon and title |
| dev tools toggle | allows Ctrl+Shift+I to open dev tools |
| terminal creation | spawns a pty with node-pty and wires output |
| terminal io | writes input and handles resize and exit |
| lifecycle cleanup | kills all terminals on quit or window close |
| packaging fields | sets app id and name for windows integration |

## electron/preload.cjs

this file exposes a narrow `terminalAPI` surface to the renderer. it includes terminal io, window controls, and clipboard access.

## src/vite-env.d.ts

this file extends the window typing for `terminalAPI` to match the preload bridge.
