import { Paper } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { FormData } from "../types";
import { RenderSegmentItem } from "../types/renderTypes";

export const SegmentItem: RendererFunction<RenderSegmentItem> = (
    props: RendererFunctionProps<RenderSegmentItem>
) => {
    const { renderer, data, formData } = props;
    const children = renderer.children ?? [];
    return (
        <Paper
            className="render-item child segment"
            variant={renderer.variant ?? "elevation"}
        >
            <RenderItem
                renderer={children}
                dataOverride={data}
                formDataOverride={formData}
            />
        </Paper>
    );
};
