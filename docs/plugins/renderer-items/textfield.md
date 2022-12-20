# TextFieldItem - `text-field`

TextFieldItems render a configurable text field, and have the following keys in addition to their required keys:

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
    // Whether the input should only accept numbers
    // Defaults to false
    "numerical"?: boolean,
    // Function to run on every input to validate
    // Defaults to no validation
    // If input is numerical, this will run after numerical check.
    // Function should return true, a string error, or false for an unspecified error
    "validator"?: ParsedFunction
}
```