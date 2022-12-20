# SourceItems
*Items used to generate multiple RendererItems*

SourceItems currently have two variants, [GeneratorSourceItems](#generatorsourceitem) and [ListSourceItems](#listsourceitem). SourceItems generate an array of RendererItems, each of which uses a subset of data instead of the root data object.

#### GeneratorSourceItem
GeneratorSourceItems execute a [ParsedFunction](./ModularRendering.md#parsedfunction) and output a list of rendered items. They follow the syntax below:
```typescript
{
    // Basic parts of all Item objects
    "supertype": "source";
    "type": "generator";
    "conditionalRender"?: ParsedFunction;
    // ParsedFunction to run
    "function": ParsedFunction;
    // A RendererItem to render
    // Instead of the root data, this uses the object or value returned by the function for all Data ValueItems
    "renderer": AllRenderItems;
}
```

#### ListSourceItem
ListSourceItems iterate over an array in the static data, returning a RendererItem for each array element. They follow the syntax below:
```typescript
{
    // Basic parts of all Item objects
    "supertype": "source",
    "type": "list",
    "conditionalRender"?: ParsedFunction,
    // Path to array in static data, in the form path.to.data
    "source": string,
    // A RendererItem to render
    // Instead of the root data, this uses array elements as data for Data ValueItems
    "renderer": AllRenderItems,
}
```
Due to a current code limitation, ListSourceItems can only iterate through static data. To iterate through arrays in form data, use a [GeneratorSourceItem](#generatorsourceitem)