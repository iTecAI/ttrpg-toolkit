# SelectFieldItem - `select-field`

SelectFieldItems render a configurable selection field, and have the following keys in addition to their required keys:

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
    // Options to render
    "options"?: SelectFieldOptionItem[] | SourceItem<SelectFieldOptionItem>
}
```

# SelectFieldOptionItem - `select-option`
This pseudo-item represents a SelectOption, and can only be rendered inside a SelectFieldItem. Its optional keys are as follows:

```typescript
{
    // Unique ID of the option
    "optionId"?: ValueItem,
    // Display value of the option
    "displayName"?: ValueItem
}
```