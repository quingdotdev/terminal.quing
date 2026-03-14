# overview

terminal by Quing is a desktop terminal focused on multi project work. it keeps projects, tabs, and panes in a single workspace and restores that workspace on launch.

## purpose

terminal by Quing was created so i can have a terminal that works with my multi project workflow and for people who need multi terminal multitasking.

## design language

slate is the design language. it keeps the interface minimal and deliberate. motion is limited to what is required for clarity, and ornament is absent. the goal is a calm, functional surface that stays out of the way.

## feature summary

| capability | intent |
| --- | --- |
| multi project workspace | keep several codebases open without fragmentation |
| tabs and panes | split work by task and keep context visible |
| pane resizing | drag handles make splits practical, not equal slices |
| profile driven shells | shells, args, and cwd are explicit and editable |
| search and palette | locate output and trigger actions without a mouse |
| workspace portability | import and export the full workspace as json |

## scope and limits

windows is the primary target. the default profiles assume windows shells and the build configuration targets windows packaging. other platforms may require new profiles and packaging changes.
