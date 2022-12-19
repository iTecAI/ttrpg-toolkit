import { Typography } from "@mui/material";
import { RendererFunction } from ".";
import { FormData } from "../types";
import { RenderTextItem } from "../types/renderTypes";
import { useValueItem } from "../utility/hooks";

export const TextItem: RendererFunction = (
    renderer: RenderTextItem,
    data: any,
    _formData: FormData
) => {
    const text = renderer.text ?? "";
    const textType = renderer.textType ?? "body1";
    return (
        <div className="render-item child text">
            <Typography variant={textType as any}>
                {useValueItem(text, data)}
            </Typography>
        </div>
    );
};
