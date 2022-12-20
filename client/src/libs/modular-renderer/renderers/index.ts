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
};
