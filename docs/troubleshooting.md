# troubleshooting

## overlay parse errors

if vite reports an invalid unicode escape, it is almost always a stray backslash in a string literal. remove the backslash and re run the dev server.

## terminal output missing or frozen

if a pane renders but does not show output, close the tab and reopen it so the pty is recreated. if the issue persists, restart the app to ensure the main process clears old pty handles.

## copy or paste does nothing

copy uses Ctrl+Shift+C and paste uses Ctrl+Shift+V. a right click inside a terminal shows the same actions. if paste is still empty, confirm your system clipboard contains text.

## workspace state looks wrong

go to settings and use reset app state, or clear the `workspace` key in local storage. import a known good workspace file after the reset.
