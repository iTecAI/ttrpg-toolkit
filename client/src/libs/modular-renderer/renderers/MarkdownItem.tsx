import ReactMarkdown from "react-markdown";
import { RendererFunction, RendererFunctionProps } from ".";
import { FormData } from "../types";
import { isArray } from "../types/guards";
import { RenderMarkdownItem } from "../types/renderTypes";
import { parseValueItem } from "../utility/parsers";
import { useValueItem } from "../utility/hooks";

export const MarkdownItem: RendererFunction<RenderMarkdownItem> = (
    props: RendererFunctionProps<RenderMarkdownItem>
) => {
    const { renderer, data, formData } = props;
    let rawText: any;
    if (isArray(renderer.text)) {
        rawText = renderer.text.join("\n");
    } else {
        rawText = renderer.text ?? "";
    }
    const text = useValueItem(rawText, data);
    return (
        <div className="render-item child markdown">
            <ReactMarkdown children={text} />
        </div>
    );
};
