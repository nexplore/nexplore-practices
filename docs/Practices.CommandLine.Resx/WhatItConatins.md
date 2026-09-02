# What it contains

The library works as an addition to `Practices.CommandLine`. It contains commands to execute an alphabetical sort of the content of one or multiple resex files.

## Commands and Options

The following commands are currently available, shown in their hierarchy:

| Command          | Type              | Usage                                                                                                                    |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `code`           | `CodeCommand`     | Groups commands that modify code.                                                                                        |
| `code sort-resx` | `ResxSortCommand` | Sorts RESX files at the specified path. The path may refer to a RESX file or to a directory that is scanned recursively. |

The following options are currently available:

| Option               | Type             | Usage                                  |
| -------------------- | ---------------- | -------------------------------------- |
| `--output` [`-o`]    | `OutputOption`   | Specifies an output file or directory. |
| `--file-path` [`-f`] | `FilePathOption` | Specifies an input file or directory.  |
| `--dry-run` [`-n`]   | `DryRunOption`   | Runs the command in dry-run mode.      |
