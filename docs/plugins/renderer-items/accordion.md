# AccordionItem - `accordion`

AccordionItems render a collapsible collection of children with a header label, and have the following keys in addition to their required keys:

```typescript
{
    // Children to render in collapsible segment
    "children"?: RendererItem[] | SourceItem,
    // Header text
    "text"?: ValueItem,
    // Header icon
    "icon"?: AvatarType,
    // Max height when expanded
    // Defaults to unlimited height
    "maxHeight"?: number,
    // If true, disables collapsing
    // Defaults to false
    "alwaysOpen"?: boolean
}
```