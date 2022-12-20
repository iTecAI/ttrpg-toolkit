# The Modular Renderer System
*Source Code: [libs/modular-renderer](../../client/src/libs/modular-renderer/index.tsx)*

The Modular Renderer is a JSON markup language designed to make data processing, data display, and dynamic form creation possible through only JSON and some basic JS.

The syntax is largely self-documenting using JSON Schemas stored [here](../../schema/renderer.schema.json), but basic documentation of the syntax and all renderable elements is included.

## Contents
- [Basic Syntax](#base-syntax)
    Core structure of Modular Rendering
- [ValueItems](#valueitems)
    Fetching static and form data
- [ParsedFunction](#parsedfunction)
    Executing JS code

## See Also
- [SourceItems](./SourceItems.md)
    Generate multiple RenderItems from arrays
- [RendererItems](./renderer-items/index.md)
    Render information in multiple formats

---

#### Base Syntax
The Modular Rendering system is composed of nested [RendererItems](./renderer-items/index.md) and [SourceItems](./SourceItems.md). These items can use static data, or use data sourced from [ValueItems](#valueitems). Every RendererItem or SourceItem must have the following structure:
```typescript
{
    // Whether the item is a Renderer or Source
    "supertype": "render" | "source",
    // The subtype of item, specified in a later section
    "type": string,
    // An optional ParsedFunction object to execute
    // If it returns false, the item and its children will not render.
    "conditionalRender"?: ParsedFunction,
    // Any other keys and values, depending on the Item type
    [key: string]: any
}
```

#### ValueItems
ValueItems are the basic value type for any displayed information that may be sourced from raw data or form data.

They can be represented by any of the following:
- A static value (number, string, boolean, etc)
- A `$directive:data` string, of any of the following formats:
    - `$data:path.to.data:optional default`
    This directive fetches data from the static data, at a period-seperated path. If not found, it will return the default or `null`
    - `$self`
    This directive returns the entire static data object. Generally useful in SourceItems.
    - `$form:fieldId:optional default`
    This directive fetches the value of a specified form field. If not found, it will return the default or `null`
- A `ValueItem` object, of any of the following formats:
    - DataItem: Fetches data from the static data object.
    ```typescript
    {
        // The ValueItem/Data supertype/type
        "supertype": "value",
        "type": "data",
        // dot-separated path to data source
        "source": string,
        // A fallback ValueItem to use as a default
        "default"?: ValueItem
    }
    ```
    - FormDataItem: Fetches data from the FormData object.
    ```typescript
    {
        // The ValueItem/FormData supertype/type
        "supertype": "value",
        "type": "form-data",
        // field ID
        "path": string,
        // A fallback ValueItem to use as a default
        "default"?: ValueItem
    }
    ```
    - TextItem: Performs string substitution, generally using nested ValueItems
    ```typescript
    {
        // The ValueItem/Text supertype/type
        "supertype": "value",
        "type": "text",
        // Template string
        // Example: "Hello {{name}}! You are {{age}} years old."
        "content": string,
        // Substitution mapping
        // Maps variable name to ValueItem
        "substitutions": {
            [key: string]: ValueItem
        }
    }
    ```
    - FunctionalItem: Runs a function and returns the output, using ValueItems as arguments (see also [ParsedFunction](#parsedfunction))
    ```typescript
    {
        // The ValueItem/Text supertype/type
        "supertype": "value",
        "type": "function",
        // JS code to run, or array of lines of JS code
        // Must be a function of form (opts: {[key: string]: any}) => any
        "function": string | string[],
        // Mapping of string key to ValueItem argument
        "opts": { [key: string]: ValueItem }
    }
    ```
    Object-based ValueItems can include other nested ValueItems, allowing for complex data processing with JSON and small JS fragments.

#### ParsedFunction
ParsedFunction objects are a generic object that allow for a function to be executed dynamically using [ValueItems](#valueitems) as arguments. It follows the following syntax:
```typescript
{
    // JS code string or array of JS code strings
    "function": string | string[];
    // Mapping of string key to ValueItem argument
    opts: { [key: string]: Literal | ValueItem };
}
```

For the sake of security, all JS code is static. DO NOT under any circumstances put eval() or Function() calls within your ParsedFunctions, as this may cause XSS vulnerabilities in any server instance that runs your plugin.