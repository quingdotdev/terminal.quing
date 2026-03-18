# architecture

terminal by Quing is a terminal emulator built on electron. it uses a multi process model to separate the user interface from the shell processes. this ensures that a crash in one terminal does not affect the rest of the application.

## process model

the main process runs in node. it creates the application window and manages the lifecycle of pty processes. it uses node-pty to spawn shells like bash, zsh, or powershell.

the renderer process runs the user interface. it is built with react and typescript. it communicates with the main process through a secure ipc bridge defined in the preload script.

the preload script acts as a gateway. it exposes a limited terminal api to the renderer while keeping the full node api hidden. this is a critical security measure.

## state management

workspace state is managed by the `useWorkspace` hook. this central source of truth handles projects, tabs, panes, and profiles. it uses standard react state and effects to keep the ui in sync with the underlying data.

state persistence is handled by the `workspace` state module. it reads and writes to local storage. it includes normalization logic to ensure the workspace remains valid even after updates to the application schema.

## view layer

the interface follows the slate design language. it is minimal and focused.

`App.tsx` serves as the root layout. it orchestrates high level ui blocks and global keyboard shortcuts.

`TerminalView.tsx` manages the terminal instance. it uses xterm to render text and handle user input. each terminal pane is isolated and communicates with its own pty process in the main process.

components like `TabStrip`, `Sidebar`, and `StatusBar` are functional and stateless where possible. they receive data through props and emit actions through callbacks.

## data flow

when a user opens a new terminal, the renderer sends a request to the main process. the main process spawns a pty and returns an identifier. output from the shell flows from node-pty through the main process and preload bridge to xterm in the renderer. user input flows in the opposite direction.
