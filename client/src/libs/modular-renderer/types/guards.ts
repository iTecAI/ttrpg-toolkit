import { AllSourceItems } from ".";
import { AllRenderItems } from ".";
import { Literal, ValueItem } from ".";

export function isSourceItem(item: any): item is AllSourceItems {
    return item.supertype !== undefined && item.supertype === "source";
}

export function isRenderItem(item: any): item is AllRenderItems {
    return item.supertype !== undefined && item.supertype === "render";
}

export function isArray(item: any): item is Array<any> {
    return item instanceof Array;
}

export function isValueItem(item: any): item is ValueItem {
    return item.supertype && item.supertype === "value";
}

export function isLiteral(item: any): item is Literal {
    const itemType = typeof item;
    return (
        itemType === "number" || itemType === "string" || itemType === "boolean"
    );
}
