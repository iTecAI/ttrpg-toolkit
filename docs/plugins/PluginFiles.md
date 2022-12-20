# Plugin Files
*Basic documentation of plugin files*

## Contents
- [Manifest](#manifest)
    Writing `manifest.json` files
- [Config Variables](#config-file-variables)
    Variables that can be used in all plugin JSON files
- [Large Files](#splitting-large-files)
    Handling larger JSON files

## See Also
- [Modular Rendering](./ModularRendering.md)
    Rendering data on the frontend with JSON markup

#### Manifest
**TODO**

#### Config File Variables
All Manifest and Config files may contain any of the following variables in a string value, using the form `$command:arg:arg:...`:
- `$workdir/cwd/working_directory:optional path`
    This command (any of workdir, cwd, or working_directory) is replaced by the current working directory (read: server root directory) followed by an optional path.
- `$env:name`
    This command is replaced by the value of the named environment variable
- `$sub:path`
    This command is replaced by a JSON object sourced from the path given in `path`. If it is an invalid path or JSON file, loading will fail. This is most useful for [Splitting Large Files](#splitting-large-files).
- `$file:path` or `$file:path:lines`
    This command returns the raw file contents of the file at `path`. If the 2nd argument (just the word "lines") is provided, it will instead return an array of lines in the specified file.

#### Splitting Large Files
It is highly likely that your plugin manifest will get extremely large, and need to be split across multiple files. Examples of this can be found in the example plugins. In short, replace the root of the sub-object you want to split into a separate file with `$sub:path/to/new/file.json`, then place the sub-object into the new file.

For example, if the file `file1.json` is as follows:
```json
{
    "aKey": "string",
    "bKey": {
        "key1": 1,
        "key2": 2
    }
}
```
It can be split into the following two files:
```json
// file1.json
{
    "aKey": "string",
    "bKey": "$sub:file2.json"
}
```
and
```json
// file2.json
{
    "key1": 1,
    "key2": 2
}
```
