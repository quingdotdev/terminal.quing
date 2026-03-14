# terminal by Quing

terminal by Quing is a multi project terminal built for people who keep several codebases open and need fast context switching. it was created to support a multi project workflow and multi terminal multitasking without extra ceremony.

## overview

this app runs on electron with xterm and node-pty. it keeps projects, tabs, and panes inside a single workspace and stores that workspace locally between launches.

## features

| capability | detail |
| --- | --- |
| multi project workspace | projects and tabs stay together and reopen in the last active state |
| panes that you control | split panes are resizable and the active pane is highlighted |
| profile based terminals | panes can use different shells with editable args and cwd |
| search and command palette | terminal search and keyboard driven actions are built in |
| themes and status | light, dark, and dusk themes with a status bar for context |
| workspace portability | import and export the full workspace as json |

## quick start

install dependencies and run the dev app.

```bash
bun install
bun run dev
```

if you do not use bun, npm is supported.

```bash
npm install
npm run dev
```

## usage

right click inside a terminal for copy, paste, select all, and find. use the command palette for split actions and workspace actions.

| action | shortcut |
| --- | --- |
| switch project | Alt+1..9 |
| switch tab | Ctrl+1..9 |
| new terminal from profile 1..3 | Ctrl+Shift+1..3 |
| command palette | Ctrl+Shift+P |
| settings | Ctrl+, |
| find in terminal | Ctrl+F |
| copy selection | Ctrl+Shift+C |
| paste | Ctrl+Shift+V |
| next tab | Ctrl+Tab |
| previous tab | Ctrl+Shift+Tab |
| focus next pane | Ctrl+Alt+ArrowRight |
| focus previous pane | Ctrl+Alt+ArrowLeft |

## docs

read the full documentation in [docs/README.md](docs/README.md). brand rules are in [docs/brand.md](docs/brand.md).
