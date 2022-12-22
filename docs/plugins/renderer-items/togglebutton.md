# ToggleButtonItem - `toggle-button`

ToggleButtonItems render a toggleable button with a label and/or icon, and have the following keys in addition to their required keys:

```typescript
{
    // Field ID
    // Defaults to no ID, removing it from the main form.
    "fieldId"?: string,
    // Button label, rendered to the right of the button
    // Defaults to no label
    "label"?: ValueItem,
    // Button icon
    // Defaults to no icon
    "icon"?: IconType
}
```