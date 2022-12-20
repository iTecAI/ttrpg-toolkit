# CardItem - `card`

CardItems render a complex card, with a possible title, subtitle, media, and body, and have the following keys in addition to their required keys:

```typescript
{
    // Paper variant
    // Defaults to "elevation"
    "variant"?: "elevation" | "outlined",
    // Children to place in body
    "children"?: RendererItem[] | SourceItem,
    // Object defining the title
    // Defaults to no title
    "title"?: {
        // Title text, required
        "title": ValueItem,
        // Subtitle text, optional
        "subtitle"?: ValueItem,
        // Header icon, optional
        "icon"?: AvatarType
    },
    // Card media
    // Defaults to no media
    "media"?: {
        // Image source, required
        "src": ValueItem,
        // Image alt text, required
        "alt": ValueItem,
        // Image height, optional
        // Defaults to automatic
        "height"?: number
    }
}
```