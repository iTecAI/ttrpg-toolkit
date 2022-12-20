# StackItem - `stack`

StackItems render a horizontal or vertical stack of child items with configurable spacing, and have the following keys in addition to their required keys:

```typescript
{
    // Direction of stack.
    // Defaults to vertical
    "direction"?: "horizontal" | "vertical",
    // Space between elements.
    // Defaults to 2
    "spacing"?: number,
    // Children to render
    "children"?: RendererItem[] | SourceItem
}
```