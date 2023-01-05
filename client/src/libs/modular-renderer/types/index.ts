import {
    RenderGroupItem,
    RenderTextItem,
    RenderDividerItem,
    RenderChipItem,
    RenderListItem,
    RenderStackItem,
    RenderTableItem,
    RenderTableRowItem,
    RenderMarkdownItem,
    RenderAbsoluteContainerItem,
    RenderAbsoluteItem,
    RenderAccordionItem,
    RenderCardItem,
    RenderSegmentItem,
    RenderMasonryItem,
    RenderSimpleFieldItem,
    RenderTextFieldItem,
    RenderSelectFieldItem,
    RenderSelectFieldOptionItem,
    RenderAutocompleteFieldItem,
    RenderSwitchItem,
    RenderToggleButtonItem,
    RenderTextEditor,
    RenderContentSelector,
} from "./renderTypes";

import * as MdReactIcons from "react-icons/md";
import * as GiReactIcons from "react-icons/gi";

export const iconMap = { md: MdReactIcons, gi: GiReactIcons };
export type IconFamily = "md" | "gi";
type IconExpanded = {
    family: IconFamily;
    name: string | ValueItem;
};

export type IconType = IconExpanded | ValueItem;

export type Literal = string | number | boolean | null | undefined;

export type FormData = { [key: string]: any };

export type ModularDocument = {
    documentId: string;
    update: (field: string, value: any) => void;
    values: FormData;
    data: RawData;
    disabled: boolean;
};

export type TextItem = {
    supertype: "value";
    type: "text";
    /**
     * @type {string}
     * String containing possible substitutions.
     * Format: "I am a {{test}} string"
     */
    content: string;
    /**
     * @type {{[key: string]: ValueItem}}
     * A mapping of substitution names to values
     */
    substitutions: { [key: string]: ValueItem };
};

export type FunctionalItem = {
    supertype: "value";
    type: "function";
    /**
     * @type {string | string[]}
     * String code (or lines of string code) of the following form:
     *     (opts: {[key: string]: any}) => string | TextItem
     */
    function: string | string[];
    opts: { [key: string]: ValueItem };
};

export type DataItem = {
    supertype: "value";
    type: "data";
    source: string;
    default?: ValueItem;
};

export type FormDataItem = {
    supertype: "value";
    type: "form-data";
    path: string;
    default?: ValueItem;
};

export type ValueItem =
    | Literal
    | TextItem
    | FunctionalItem
    | DataItem
    | FormDataItem;
export type ValueStringDirective = "data" | "self" | "form";
export const ValueStringDirectiveNames = ["data", "self", "form"];

export type RawDataValue = ValueItem | RawData | any[];
export type RawData = { [key: string]: RawDataValue };

export type ParsedFunction = {
    /**
     * @type {string | string[]}
     * String code (or lines of string code) of the following form:
     *     (opts: {[key: string]: any}) => any
     */
    function: string | string[];
    opts: { [key: string]: Literal | ValueItem };
};

// eslint-disable-next-line
export type ListSourceItem<T = AllRenderItems> = {
    supertype: "source";
    type: "list";
    /**
     * Dot path to an array value in the data (ie. i.am.a.path.to.an.array)
     * @type {string}
     */
    source: string;
    renderer: AllRenderItems;
    conditionalRender?: ParsedFunction;
};

// eslint-disable-next-line
export type GeneratorSourceItem<T = AllRenderItems> = {
    supertype: "source";
    type: "generator";
    /**
     * A function that takes data and outputs an array of {[key: string]: ValueItem | {...}}
     * @type {string}
     */
    function: ParsedFunction;
    renderer: AllRenderItems;
    conditionalRender?: ParsedFunction;
};

export type AvatarType =
    | {
          type: "text";
          text: ValueItem;
      }
    | {
          type: "icon";
          icon: IconType;
      }
    | {
          type: "image";
          source: ValueItem;
          alt: ValueItem;
      };

export type AllRenderItems =
    | RenderGroupItem
    | RenderTextItem
    | RenderDividerItem
    | RenderChipItem
    | RenderListItem
    | RenderStackItem
    | RenderTableItem
    | RenderTableRowItem
    | RenderMarkdownItem
    | RenderAbsoluteContainerItem
    | RenderAbsoluteItem
    | RenderAccordionItem
    | RenderCardItem
    | RenderSegmentItem
    | RenderMasonryItem
    | RenderSimpleFieldItem
    | RenderTextFieldItem
    | RenderSelectFieldItem
    | RenderSelectFieldOptionItem
    | RenderAutocompleteFieldItem
    | RenderSwitchItem
    | RenderToggleButtonItem
    | RenderTextEditor
    | RenderContentSelector;
export type AllSourceItems<T = any> =
    | ListSourceItem<T>
    | GeneratorSourceItem<T>;

export type AllItems = AllRenderItems | AllSourceItems;
