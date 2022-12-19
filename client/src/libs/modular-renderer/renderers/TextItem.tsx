import { Typography } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { FormData } from "../types";
import { RenderTextItem } from "../types/renderTypes";
import { useValueItem } from "../utility/hooks";

export const TextItem: RendererFunction<RenderTextItem> = (
    props: RendererFunctionProps<RenderTextItem>
) => {
    const { renderer, data, formData } = props;
    const text = renderer.text ?? "";
    const textType = renderer.textType ?? "body1";
    const style = renderer.style ?? [];
    return (
        <div className="render-item child text">
            <Typography
                variant={textType as any}
                style={{
                    fontWeight: style.includes("bold") ? 400 : undefined,
                    textDecorationLine: [
                        style.includes("underline") ? "underline" : "",
                        style.includes("strikethrough") ? "line-through" : "",
                    ]
                        .join(" ")
                        .trim(),
                    fontStyle: style.includes("italic") ? "italic" : undefined,
                }}
            >
                {useValueItem(text, data)}
            </Typography>
        </div>
    );
};
