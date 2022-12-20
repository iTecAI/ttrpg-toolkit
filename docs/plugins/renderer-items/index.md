# RendererItems
*Items that render themselves and nested children*

RendererItems render themselves, any included data, and any nested data. They are the core of the Modular Rendering system.

The basic syntax for all RendererItems is as follows:
```typescript
{
    // Supertype of all RendererItems
    "supertype": "render",
    // Any of the types listed in the Renderer Types section
    "type": string,
    // Optional function to determine whether the function will render
    "conditionalRender"?: ParsedFunction,
    ...
}
```
As a rule, all RendererItems must only have the `supertype` and `type` keys. All other keys have default values, specified in the individual documentation of each type.

## Renderer Types
- [GroupItem - `group`](./group.md)
    Renders a group of child items
- [TextItem - `text`](./text.md)
    Renders formatted text
- [DividerItem - `divider`](./divider.md)
    Renders a horizontal divider
- [ChipItem - `chip`](./chip.md)
    Renders a chip/tag
- [StackItem - `stack`](./stack.md)
    Renders a horizontal or vertical stack of children
- [ListItem - `list`](./list.md)
    Renders an ordered or bulleted list of children
- [TableItem - `table`](./table.md)
    Renders tabulated data. Also includes the [TableRowItem - `tableRow`](./table.md#tablerowitem---tablerow) item
- [MarkdownItem - `markdown`](./markdown.md)
    Renders markdown text
- [AccordionItem - `accordion`](./accordion.md)
    Renders a collapsible collection of items
- [CardItem - `card`](./card.md)
    Renders a complex card
- [SegmentItem - `segment`](./segment.md)
    Renders a raised or outlined section
- [AbsoluteItem - `absolute`](./absolute.md)
    Renders an absolutely-positioned item within an [AbsoluteContainerItem - `absolute-container`](./absolute.md#absolutecontaineritem---absolute-container)
- [MasonryItem - `masonry`](./masonry.md)
    Renders children in a masonry configuration
- [TextFieldItem - `text-field`](./textfield.md)
    Renders a customizable text field