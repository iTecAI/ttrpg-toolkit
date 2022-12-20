# SegmentItem - `segment`

SegmentItems render a raised or outlined section, and have the following keys in addition to their required keys:

```typescript
{
    // Paper variant
    // Defaults to "elevation"
    "variant"?: "elevation" | "outlined",
    // Children to render
    "children"?: RendererItem[] | SourceItem
}
```