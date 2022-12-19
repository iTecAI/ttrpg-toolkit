import { ParsedFunction, FormData } from "../types";
import { GroupItem } from "./GroupItem";
import { TextItem } from "./TextItem";
import { SimpleFieldItem } from "./SimpleFieldItem";

export type RendererFunction = (
    renderer: {
        supertype: "render";
        type: any;
        conditionalRender?: ParsedFunction;
        [key: string]: any;
    },
    data: any,
    formData: FormData
) => JSX.Element;

export const Renderers: {
    [key: string]: RendererFunction;
} = {
    group: GroupItem,
    text: TextItem,
    "simple-field": SimpleFieldItem,
};
