# AutocompleteFieldItem - `autocomplete-field`

AutocompleteFieldItems render a text field that provides suggestions for input, and have the following keys in addition to their required keys:

```typescript
{
    // Field ID. 
    // Defaults to no ID, removing it from the main form.
    "fieldId"?: string,
    // Input variant
    // Defaults to "outlined"
    "variant"?: "filled" | "outlined" | "standard",
    // Whether to take up max width
    // Defaults to false
    "fullWidth"?: boolean,
    // Input adornment
    // Defaults to no adornment
    "icon"?: {
        // Icon/Avatar to render, required
        "type": AvatarType,
        // Position to render, optional
        // Defaults to "start"
        "position"?: "start" | "end"
    },
    // Input placeholder
    // Defaults to none
    "placeholder"?: ValueItem,
    // Input label
    // Defaults to none
    "label"?: ValueItem,
    // Whether to allow multiple inputs or not
    // Defaults to false
    "multiple"?: boolean,
    // Array of options or a ValueItem that returns an array
    // In the case of a ValueItem, a FunctionItem might be useful here
    "options"?: string[] | ValueItem,
    // Whether to allow inputs that aren't in the options array
    // Defaults to false
    "allowAny"?: boolean
}
```