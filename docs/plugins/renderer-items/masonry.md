# MasonryItem - `masonry`

MasonryItems render their children in a masonry configuration, and have the following keys in addition to their required keys:

```typescript
{
    // Children to render
    "children"?: RendererItem[] | SourceItem,
    // Number of columns
    // Defaults to 2
    "columns"?: number,
    // Spacing between elements
    // Defaults to 2
    "spacing"?: number
}
```