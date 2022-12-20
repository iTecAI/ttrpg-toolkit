# TextItem - `text`

TextItems render formatted text, and have the following keys in addition to their required keys:

```typescript
{
    // Text to render
    "text"?: ValueItem,
    // Text size
    // Defaults to body1
    "textType"?: "body1" | "body2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "raw",
    // Text style
    // Defaults to no styling
    "style"?: ("italic" | "bold" | "strikethrough" | "underline")[]
}
```