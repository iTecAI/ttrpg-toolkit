import ReactMarkdown from "react-markdown";
import { RendererFunction, RendererFunctionProps } from ".";
import { isArray } from "../types/guards";
import { RenderMarkdownItem } from "../types/renderTypes";
import { useValueItem } from "../utility/hooks";
import { Box } from "@mui/system";
import rehypeRaw from "rehype-raw";

function escapeDangerous(text: string | null): string {
    if (!text) {
        return "";
    }
    return text
        .replaceAll(/<.?script.*?>/g, "[script UNSAFE]")
        .replaceAll(/<.?style.*?>/g, "[style UNSAFE]");
}

export const MarkdownItem: RendererFunction<RenderMarkdownItem> = (
    props: RendererFunctionProps<RenderMarkdownItem>
) => {
    const { renderer, data } = props;
    let rawText: any;
    if (isArray(renderer.text)) {
        rawText = renderer.text.join("\n");
    } else {
        rawText = renderer.text ?? "";
    }
    const text: string = useValueItem(rawText, data);
    return (
        <Box
            className="render-item child markdown"
            sx={{
                "*": {
                    color: "white",
                },
            }}
        >
            <ReactMarkdown
                children={escapeDangerous(text)}
                rehypePlugins={[rehypeRaw]}
            />
        </Box>
    );
};
