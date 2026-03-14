# profiles

profiles define the shell, arguments, and working directory used when a terminal pane is created. each pane stores a profile id and may also store overrides for shell, args, and cwd.

## default profiles

the default set is stored in the workspace state and includes one editable profile.

| profile | shell | editable |
| --- | --- | --- |
| powershell | powershell.exe | no |
| command prompt | cmd.exe | no |
| bash | bash.exe | no |
| custom | powershell.exe | yes |

## editing

profile editing lives in settings. shell is stored as a string, args are stored as a string array, and cwd is stored as a string. args are split on spaces when you edit the field. empty entries are dropped.

## overrides

pane level overrides take precedence over the profile values. this lets you keep a shared profile while pointing a specific pane at a different working directory or shell.
