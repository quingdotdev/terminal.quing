# workspace

the workspace is how terminal by Quing stores its state. it is kept in local storage and can be exported as a json file. the current workspace version is 2.

## persistence

on launch, the app reads the workspace from local storage. it then normalizes the data. if the stored data is from an older version, the app migrates it to the new structure. this ensures the app can always read your saved terminals and projects.

## import and export

you can export your full workspace to a file named `terminal-workspace.json`. you can also import a workspace file. the app validates and normalizes the file before loading it. if a file is invalid, the app rejects it.

## structure

the workspace uses a clear hierarchy. it contains global settings like the version, the theme, and the profiles. it also contains the list of projects.

a project represents a group of work. it has an id and a name. it contains a list of tabs.

a tab is a single view within a project. it has an id and a title. it can have a custom color. it contains a list of panes. it also tracks which pane is currently active and the relative sizes of all panes.

a pane is a single terminal instance. it has an id and a title. it stores the configuration for its shell process. it can override the default shell, arguments, and working directory.

## example

```json
{
  "version": 2,
  "projects": [
    {
      "id": "1",
      "name": "main",
      "tabs": [
        {
          "id": "t1",
          "title": "powershell",
          "panes": [
            {
              "id": "p1",
              "title": "powershell",
              "profileId": "powershell"
            }
          ],
          "paneSizes": [100],
          "activePaneId": "p1"
        }
      ]
    }
  ],
  "activeProjectId": "1",
  "activeTabId": "t1",
  "theme": "dark",
  "profiles": [],
  "sidebarCollapsed": false
}
```
