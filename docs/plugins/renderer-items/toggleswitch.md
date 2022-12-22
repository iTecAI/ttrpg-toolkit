# ToggleSwitchItem - `toggle-switch`

ToggleSwitchItems render a switch, checkbox, or radio button that can be toggled, and have the following keys in addition to their required keys:

```typescript
{
    // Field ID
    // Defaults to no ID, removing it from the main form.
    "fieldId"?: string,
    // Switch variant
    // Defaults to "switch"
    "variant"?: "switch" | "checkbox" | "radio",
    // Switch label, rendered to the right of the switch
    "label"?: ValueItem
}
```