import {
    ParsedFunction,
    ValueItem,
    AllSourceItems,
    AllRenderItems,
    AvatarType,
} from ".";

export type RenderGroupItem = {
    supertype: "render";
    type: "group";
    conditionalRender?: ParsedFunction;
    children?: AllRenderItems[] | AllSourceItems;
};

export type RenderTextItem = {
    supertype: "render";
    type: "text";
    text?: ValueItem;
    textType?:
        | "body1"
        | "body2"
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6"
        | "subtitle1"
        | "subtitle2"
        | "raw";
    style?: ("italic" | "bold" | "strikethrough" | "underline")[];
    conditionalRender?: ParsedFunction;
};

export type RenderSimpleFieldItem = {
    supertype: "render";
    type: "simple-field";
    conditionalRender?: ParsedFunction;
    fieldId?: string;
};

export type RenderDividerItem = {
    supertype: "render";
    type: "divider";
    child?: AllRenderItems;
    variant?: "full" | "inset" | "middle";
    conditionalRender?: ParsedFunction;
};

export type RenderChipItem = {
    supertype: "render";
    type: "chip";
    conditionalRender?: ParsedFunction;
    text?: ValueItem;
    filled?: boolean;
    avatar?: AvatarType;
};

export type RenderStackItem = {
    supertype: "render";
    type: "stack";
    conditionalRender?: ParsedFunction;
    direction?: "horizontal" | "vertical";
    spacing?: number;
    children?: AllRenderItems[] | AllSourceItems;
};

export type RenderListItem = {
    supertype: "render";
    type: "list";
    conditionalRender?: ParsedFunction;
    itemMarkers?:
        | {
              ordered: true;
              style:
                  | "armenian"
                  | "cjk-ideographic"
                  | "decimal"
                  | "decimal-leading-zero"
                  | "georgian"
                  | "hebrew"
                  | "hiragana"
                  | "hiragana-iroha"
                  | "katakana"
                  | "katakana-iroha"
                  | "lower-alpha"
                  | "lower-greek"
                  | "lower-latin"
                  | "lower-roman"
                  | "upper-alpha"
                  | "upper-greek"
                  | "upper-latin"
                  | "upper-roman";
          }
        | {
              ordered: false;
              style: "circle" | "disc" | "square";
          };
    children?: AllRenderItems[] | AllSourceItems;
};

export type RenderTableItem = {
    supertype: "render";
    type: "table";
    conditionalRender?: ParsedFunction;
    title?: ValueItem;
    headers?: ValueItem[];
    children?: RenderTableRowItem[] | AllSourceItems<RenderTableRowItem>;
};

export type RenderTableRowItem = {
    supertype: "render";
    type: "tableRow";
    conditionalRender?: ParsedFunction;
    children?: AllRenderItems[] | AllSourceItems;
};

export type RenderMarkdownItem = {
    supertype: "render";
    type: "markdown";
    conditionalRender?: ParsedFunction;
    text?: ValueItem | string[];
};

export type RenderAccordionItem = {
    supertype: "render";
    type: "accordion";
    conditionalRender?: ParsedFunction;
    children?: AllRenderItems[] | AllSourceItems;
    text?: ValueItem;
    icon?: AvatarType;
    maxHeight?: number;
    alwaysOpen?: boolean;
};

export type RenderCardItem = {
    supertype: "render";
    type: "card";
    conditionalRender?: ParsedFunction;
    variant?: "elevation" | "outlined";
    children?: AllRenderItems[] | AllSourceItems;
    title?: {
        title: ValueItem;
        subtitle?: ValueItem;
        icon?: AvatarType;
    };
    media?: {
        src: ValueItem;
        alt: ValueItem;
        height?: number;
    };
};

export type RenderSegmentItem = {
    supertype: "render";
    type: "segment";
    conditionalRender?: ParsedFunction;
    children?: AllRenderItems[] | AllSourceItems;
    variant?: "elevation" | "outlined";
};

export type RenderAbsoluteItem = {
    supertype: "render";
    type: "absolute";
    conditionalRender?: ParsedFunction;
    child?: AllRenderItems;
    top?: number; // Percent
    left?: number; // Percent
    width?: number; // Percent
    height?: number; // Percent
};

export type RenderAbsoluteContainerItem = {
    supertype: "render";
    type: "absolute-container";
    conditionalRender?: ParsedFunction;
    children?: RenderAbsoluteItem[] | AllSourceItems<RenderAbsoluteItem>;
    height?: number; // Percent
};

export type RenderMasonryItem = {
    supertype: "render";
    type: "masonry";
    conditionalRender?: ParsedFunction;
    children?: AllRenderItems[] | AllSourceItems;
    columns?: number;
    spacing?: number;
};

export type RenderTextFieldItem = {
    supertype: "render";
    type: "text-field";
    conditionalRender?: ParsedFunction;
    fieldId?: string;
    variant?: "filled" | "outlined" | "standard";
    fullWidth?: boolean;
    icon?: {
        type: AvatarType;
        position?: "start" | "end";
    };
    placeholder?: ValueItem;
    label?: ValueItem;
    numerical?: boolean;
    validator?: ParsedFunction;
};

export type RenderSelectFieldOptionItem = {
    supertype: "render";
    type: "select-option";
    conditionalRender?: ParsedFunction;
    optionId?: ValueItem;
    displayName?: ValueItem;
};

export type RenderSelectFieldItem = {
    supertype: "render";
    type: "select-field";
    conditionalRender?: ParsedFunction;
    fieldId?: string;
    variant?: "filled" | "outlined" | "standard";
    fullWidth?: boolean;
    icon?: {
        type: AvatarType;
        position?: "start" | "end";
    };
    multiple?: boolean;
    placeholder?: ValueItem;
    label?: ValueItem;
    options?:
        | RenderSelectFieldOptionItem[]
        | AllSourceItems<RenderSelectFieldOptionItem>;
};

export type RenderAutocompleteFieldOptionItem = {
    supertype: "render";
    type: "autocomplete-option";
    conditionalRender?: ParsedFunction;
    option?: ValueItem;
};

export type RenderAutocompleteFieldItem = {
    supertype: "render";
    type: "autocomplete-field";
    conditionalRender?: ParsedFunction;
    fieldId?: string;
    variant?: "filled" | "outlined" | "standard";
    fullWidth?: boolean;
    icon?: {
        type: AvatarType;
        position?: "start" | "end";
    };
    multiple?: boolean;
    placeholder?: ValueItem;
    label?: ValueItem;
    options?: string[] | ValueItem;
    allowAny?: boolean;
};
