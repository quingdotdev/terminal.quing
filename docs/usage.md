# usage

this guide describes how to work in terminal by Quing once it is running.

## workspace model

a project is the top level container. each project has tabs. each tab can contain one or more panes. the active tab and active pane receive input, and both are stored so the app can restore your last context.

## navigation

use keyboard shortcuts for fast switching.

| action | shortcut |
| --- | --- |
| switch project | Alt+1..9 |
| switch tab | Ctrl+1..9 |
| next tab | Ctrl+Tab |
| previous tab | Ctrl+Shift+Tab |
| focus next pane | Ctrl+Alt+ArrowRight |
| focus previous pane | Ctrl+Alt+ArrowLeft |
| open command palette | Ctrl+Shift+P |
| open settings | Ctrl+, |

## panes and resizing

split a tab into panes by using the tab context menu or the command palette. each split has a drag handle between panes. drag to set the width you need. the active pane is outlined so focus is clear.

## command palette

the command palette is the main control surface for actions that do not have dedicated shortcuts. it supports search as you type. the actions below are always available, along with per profile actions.

| command palette action | behavior |
| --- | --- |
| new terminal from profile | creates a tab using the selected profile |
| split active tab | adds a pane next to the active pane |
| unsplit active tab | converts panes into separate tabs |
| focus next pane | moves focus right |
| focus previous pane | moves focus left |
| find in terminal | opens terminal search |
| copy selection | copies current selection |
| paste | pastes from the system clipboard |
| toggle theme | rotates light, dark, and dusk |
| open settings | shows the settings view |
| expand or collapse sidebar | toggles project list density |
| export workspace | saves workspace to a json file |
| import workspace | loads a workspace json file |

## search

press Ctrl+F to open terminal search. enter a query, then use the up and down arrows to move through matches. close the bar with Escape.

## copy and paste

right click inside a terminal for copy, paste, select all, and find. keyboard shortcuts use Ctrl+Shift+C and Ctrl+Shift+V to match native terminal behavior on windows.

## status bar

the status bar reports project name, tab title, profile, current working directory, terminal size, and connection state. it is present in both light and dark themes.

## settings

settings include profile editing, appearance, workspace import and export, and a reset option for the local workspace state.
