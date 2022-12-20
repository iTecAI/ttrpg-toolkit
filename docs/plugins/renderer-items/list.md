# ListItem - `list`

ListItems render an ordered or bulleted list of children, and have the following keys in addition to their required keys:

```typescript
{
    // Style of markers
    // Defaults to {ordered: false, style: "circle"}
    "itemMarkers"?: MarkerStyle,
    // Children to render
    "children"?: RendererItem[] | SourceItem
}
```

`MarkerStyle`:
```typescript
// Either of the following
{
    "ordered": true,
    "style": "armenian" | "cjk-ideographic" | "decimal"
    | "decimal-leading-zero" | "georgian" | "hebrew" | "hiragana"
    | "hiragana-iroha" | "katakana" | "katakana-iroha" | "lower-alpha"
    | "lower-greek" | "lower-latin" | "lower-roman" | "upper-alpha" |
    "upper-greek" | "upper-latin" | "upper-roman"
}

// OR

{
    "ordered": false,
    "style": "circle" | "disc" | "square"
}
```