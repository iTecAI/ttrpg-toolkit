# AbsoluteItem - `absolute`

AbsoluteItems render absolutely-positioned elements, and have the following keys in addition to their required keys:

```typescript
{
    // Single child to position
    "child"?: RendererItem,
    // Values in percentages, related to container
    // Positions default to 0%
    // Sizes default to fit-content
    "top"?: number,
    "left"?: number,
    "width"?: number,
    "height"? number
}
```

AbsoluteItems must be contained within an AbsoluteContainerItem. All percentages are relative to this container.

# AbsoluteContainerItem - `absolute-container`

AbsoluteContainerItems render a container that contains multiple AbsoluteItems, and have the following keys in addition to their required keys:

```typescript
{
    // Collection of AbsoluteItems to render
    "children"?: AbsoluteItem[] | SourceItem<AbsoluteItem>,
    // Container height, in percent
    // Defaults to 100%
    "height"?: number
}
```