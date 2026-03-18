# code walkthrough

this is a granular guide to the implementation of terminal by Quing. it explains every major block and function in order so a developer can learn how the app works by reading the source code.

## src/App.tsx

the root component orchestrates the layout and maps keyboard shortcuts to workspace actions.

the first block contains the imports for react hooks, lucide icons, and the local components used to build the interface. it also loads the `useWorkspace` and `useKeyboardShortcuts` hooks which contain the bulk of the logic.

the `PRESET_COLORS` constant defines the palette used for tab coloring. these values are passed to the context menu.

inside the component, we first extract the workspace state and actions. this includes projects, profiles, and methods like `addTab` or `splitTab`. this keeps the root file clean and focused on layout.

the local state block handles ui specific values. this includes the current view, menu visibility, palette search text, and resizing state. these values do not need to be persisted between sessions.

the refs block stores references to dom elements and api instances. these are used for focusing inputs, closing menus when clicking outside, and interacting directly with the terminal instances.

the theme effect applies the selected theme to the document root. it sets the `data-theme-family` and `data-theme-variant` attributes which control the css variables.

the derivation block computes the active project, tab, and pane based on the ids in the workspace state. this ensures the rest of the file always has access to the correct data objects.

the `resolvePaneConfig` function determines the shell, arguments, and working directory for a specific terminal. it uses profile values as defaults but allows per pane overrides.

the clipboard handlers manage copy and paste. they interact with the electron bridge to read and write to the system clipboard and the active xterm instance.

the keyboard shortcuts hook maps keys to actions. it handles global shortcuts like opening the palette, switching tabs, and changing themes.

the `paletteActions` memo builds the list of commands for the command palette. it filters the list based on the user search query.

the resize logic block handles the dragging of pane handles. it uses mouse events to update the percentage widths of adjacent panes in real time.

the layout effect for compact tabs calculates if the tab strip is overflowing. if there are too many tabs, it switches the display to a compact mode.

the `renderTabLabel` function creates the label for a tab. for split tabs, it joins the names of all internal panes with a separator.

the final render block defines the app layout. it uses the `Sidebar`, `TabStrip`, `TerminalView`, and `StatusBar` components. it also mounts overlay components like the command palette and context menu.

## src/hooks/useWorkspace.ts

this hook is the source of truth for all workspace data and operations.

the core state block defines the fundamental data structures. this includes the list of projects, the shell profiles, and the active ids. it also handles the theme and sidebar settings.

the persistence effect watches for changes to any workspace value. whenever the state changes, it serializes the data and writes it to local storage.

the `getProfileById` helper resolves a profile reference. if a pane points to a profile that no longer exists, it falls back to a safe default.

the `setActiveTab` and `activatePane` functions handle navigation. they update the active ids and clear any activity indicators for the target tab.

the `addTab` function creates a new tab with a single terminal pane. it generates unique ids and uses the selected profile for the initial configuration.

the `splitTab` function handles the complexity of terminal layouts. it can add a fresh pane to a tab or merge panes from a different tab. it also normalizes the widths so all panes fit within the view.

the `unsplitTab` function performs the opposite. it takes a tab with multiple panes and explodes them into individual tabs.

the `moveTab` and `reorderTabs` functions handle the arrangement of tabs within a project. they use array splicing to change the tab order.

the `setTabColor` function updates the theme color for a tab. if the tab only contains one terminal, it also applies the color to that pane for consistency.

the removal functions handle the deletion of panes, tabs, and projects. they include logic to ensure the app always has an active target after a deletion.

the `duplicateTab` function clones a tab and all its panes. it assigns new ids to every object to prevent state conflicts.

the `addProject` function scaffolds a new project with a default name and a single terminal tab.

the renaming handlers manage inline editing. they update the name of a project or tab and handle any side effects like updating single pane titles.

the `resetWorkspace` function wipes all data from local storage and restores the default application state.

## src/components/TerminalView.tsx

this component manages a single xterm.js instance and its connection to the shell.

the ligature block defines the common character sequences that should be joined into symbols. it uses a regular expression and an xterm character joiner to render these symbols.

the `TerminalApi` interface defines how other components can control the terminal. it exposes methods for focus, selection, and searching.

the visibility effect ensures that terminals are only active when they are on screen. it triggers a resize when a hidden pane becomes visible to ensure the text fits the new dimensions.

the theme effect updates the xterm colors and font settings whenever the global app theme changes.

the main lifecycle effect is the most important block. it creates the xterm instance, loads the fit and search addons, and mounts the terminal to the dom.

the `initTerminal` function inside this effect handles the pty connection. it asks the electron bridge to spawn a real shell process. it then wires up data listeners so text can flow between the shell and the screen.

the `ResizeObserver` monitors the terminal container. if the user resizes a pane or the window, it calculates the new number of rows and columns and notifies the pty process.

the cleanup logic runs when the terminal is removed. it kills the shell process and disposes of the xterm instance to prevent memory leaks.

the ligature effect toggles symbols on and off at runtime. it registers or removes the character joiner based on the user preference in settings.

## src/state/workspace.ts

this module handles the serialization and validation of the workspace.

the normalization block is critical for stability. it checks the data structure for missing fields or invalid values. if it finds an error, it repairs the data before the app starts.

the migration block handles updates between versions. if a user has an old workspace file, it converts the data into the current schema without losing their settings.

the load and save functions provide a safe interface for local storage. they include error handling and quota checks to prevent data loss.
