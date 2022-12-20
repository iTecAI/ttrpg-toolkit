# TableItem - `table`

TableItems render tabulated data, and have the following keys in addition to their required keys:

```typescript
{
    // Table title
    "title"?: ValueItem,
    // Array of ValueItems to use as column headings.
    "headers"?: ValueItem[],
    // Rows to render
    "children"?: TableRowItem[] | SourceItem<TableRowItem>
}
```

# TableRowItem - `tableRow`

TableRowItems render a single row of a table, and have the following keys in addition to their required keys:

```typescript
{
    // Array of children, one per column.
    "children"?: RendererItem[] | SourceItem
}
```