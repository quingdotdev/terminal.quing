# architecture

terminal by Quing is a classic electron app with a renderer ui and a node based main process. node-pty provides the shell processes, and xterm renders them.

## layers

| layer | responsibility |
| --- | --- |
| electron main | creates the window and spawns pty processes |
| preload bridge | exposes a narrow terminal api to the renderer |
| renderer ui | manages workspace state and xterm instances |
| storage | persists workspace state in local storage |

## data flow

the renderer creates a terminal pane and requests a pty from the main process. data flows both ways through ipc.

```text
renderer -> preload -> main -> node-pty
renderer <- preload <- main <- node-pty
```

## key files

| file | role |
| --- | --- |
| src/App.tsx | workspace state, ui layout, and commands |
| src/components/TerminalView.tsx | xterm instance and terminal api |
| src/state/workspace.ts | persistence and normalization |
| src/state/themes.ts | theme tokens and xterm themes |
| electron/main.js | app window and pty lifecycle |
| electron/preload.cjs | ipc bridge and clipboard access |
