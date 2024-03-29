import { FormData } from "../types";
import { GroupItem } from "./GroupItem";
import { TextItem } from "./TextItem";
import { SimpleFieldItem } from "./SimpleFieldItem";
import { DividerItem } from "./DividerItem";
import { ChipItem } from "./ChipItem";
import { StackItem } from "./StackItem";
import { ListItem } from "./ListItem";
import { TableItem, TableRowItem } from "./TableItem";
import { MarkdownItem } from "./MarkdownItem";
import { AccordionItem } from "./AccordionItem";
import { CardItem } from "./CardItem";
import { SegmentItem } from "./SegmentItem";
import { MasonryItem } from "./MasonryItem";
import { AbsoluteItem, AbsoluteContainerItem } from "./AbsoluteItem";
import { TextFieldItem } from "./TextFieldItem";
import { SelectFieldItem } from "./SelectFieldItem";
import { AutocompleteFieldItem } from "./AutocompleteFieldItem";
import { SwitchItem } from "./SwitchItem";
import { ToggleButtonItem } from "./ToggleButtonItem";
import { TextEditorItem } from "./TextEditor";
import { ContentSelectorFieldItem } from "./ContentSelectorItem";

export type RendererFunctionProps<T> = {
    renderer: T;
    data: any;
    formData: FormData;
};

export type RendererFunction<T> = (
    props: RendererFunctionProps<T>
) => JSX.Element;

export const Renderers: {
    [key: string]: RendererFunction<any>;
} = {
    group: GroupItem,
    text: TextItem,
    "simple-field": SimpleFieldItem,
    divider: DividerItem,
    chip: ChipItem,
    stack: StackItem,
    list: ListItem,
    table: TableItem,
    tableRow: TableRowItem,
    markdown: MarkdownItem,
    accordion: AccordionItem,
    card: CardItem,
    segment: SegmentItem,
    masonry: MasonryItem,
    absolute: AbsoluteItem,
    "absolute-container": AbsoluteContainerItem,
    "text-field": TextFieldItem,
    "select-field": SelectFieldItem,
    "autocomplete-field": AutocompleteFieldItem,
    "toggle-switch": SwitchItem,
    "toggle-button": ToggleButtonItem,
    "text-editor": TextEditorItem,
    "content-selector": ContentSelectorFieldItem,
};
