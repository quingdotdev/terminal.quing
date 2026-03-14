# workspace

the workspace is persisted in local storage and can be exported to a json file. the stored version is `2`.

## persistence

on launch, the app reads `workspace` from local storage and normalizes it. if legacy keys such as `projects`, `activeProjectId`, or `theme` exist, they are migrated into the new structure.

## import and export

export writes the full workspace to `terminal-workspace.json`. import replaces the current workspace after validation and normalization. invalid files are rejected with an error prompt.

## schema

| field | type | notes |
| --- | --- | --- |
| version | number | current version is 2 |
| projects | array | list of project objects |
| activeProjectId | string | current project id |
| activeTabId | string | current tab id |
| theme | string | `light`, `dark`, or `dusk` |
| profiles | array | profile definitions |
| sidebarCollapsed | boolean | sidebar density flag |

project objects contain tabs.

| project field | type | notes |
| --- | --- | --- |
| id | string | stable id |
| name | string | display name |
| tabs | array | list of tab objects |

tab objects contain panes.

| tab field | type | notes |
| --- | --- | --- |
| id | string | stable id |
| title | string | display name |
| panes | array | list of pane objects |
| color | string | optional tab color |
| paneSizes | array | per pane widths in percent |
| activePaneId | string | current pane id |

pane objects carry terminal settings.

| pane field | type | notes |
| --- | --- | --- |
| id | string | stable id |
| title | string | display name |
| color | string | optional pane color |
| profileId | string | profile reference |
| shell | string | optional override |
| args | array | optional override |
| cwd | string | optional override |
| lastActivityTs | number | optional timestamp |

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
