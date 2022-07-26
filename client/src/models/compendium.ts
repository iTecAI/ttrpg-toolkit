import { ModularRenderItem } from "../pages/compendium/renderers/ModularRenderer";
import { AbstractIconType } from "../util/AbstractIcon";

export type DataItem = {
    name: string;
    oid: string;
    [key: string]: any;
};

export type VariableItem =
    | {
          type: "function";
          function: string | string[]; // JS function in string format to be evaluated.
          // Should follow (options: {[key: string]: any}) => string
          options: { [key: string]: string };
      }
    | {
          type: "text";
          source: string;
      };

export type TextItem = {
    text: string;
    vars: { [key: string]: string | VariableItem };
};

export type RenderText = TextItem | string;

export type IconProps = {
    group: AbstractIconType;
    name: string;
};

export type ContentSegment = {
    icon?: IconProps;
    name: RenderText;
    content: RenderText;
    conditional?: {
        // Set a lambda function to determine whether it renders or not
        function: string | string[]; // JS Function (options: {[key: string]: any}) => boolean
        options: { [key: string]: string };
    };
};

export type CardRendererModel = {
    title: RenderText;
    subtitle?: RenderText;
    image?: RenderText;
    content:
        | {
              type: "text";
              text: RenderText;
          }
        | {
              type: "segments";
              count_per_row: 1 | 2 | 3;
              segments: ContentSegment[];
          };
};

export type CardExpandedModel = {
    title: RenderText;
    subtitle?: RenderText;
    contents: ModularRenderItem[];
};

export type CompendiumItemRenderer = {
    render_mode: "card";
    expanded: CardExpandedModel;
    item: CardRendererModel;
};
