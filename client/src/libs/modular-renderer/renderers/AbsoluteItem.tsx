import { Box } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import {
    RenderAbsoluteItem,
    RenderAbsoluteContainerItem,
} from "../types/renderTypes";

export const AbsoluteItem: RendererFunction<RenderAbsoluteItem> = (
    props: RendererFunctionProps<RenderAbsoluteItem>
) => {
    const { renderer, data, formData } = props;
    const child = renderer.child ?? null;

    const top = renderer.top ? `${renderer.top}%` : undefined;
    const left = renderer.left ? `${renderer.left}%` : undefined;
    const width = renderer.width ? `${renderer.width}%` : "fit-content";
    const height = renderer.height ? `${renderer.height}%` : "fit-content";

    return (
        <div
            className="render-item child absolute-item"
            style={{
                top: top,
                left: left,
                width: width,
                height: height,
                display: "inline-block",
            }}
        >
            {child && (
                <RenderItem
                    renderer={child}
                    dataOverride={data}
                    formDataOverride={formData}
                />
            )}
        </div>
    );
};

export const AbsoluteContainerItem: RendererFunction<
    RenderAbsoluteContainerItem
> = (props: RendererFunctionProps<RenderAbsoluteContainerItem>) => {
    const { renderer, data, formData } = props;
    const children = renderer.children ?? [];
    const height = renderer.height ? `${renderer.height}%` : "100%";

    return (
        <Box
            className="render-item child absolute-container-item"
            sx={{
                display: "inline-block",
            }}
            height={height}
        >
            <RenderItem
                renderer={children}
                dataOverride={data}
                formDataOverride={formData}
            />
        </Box>
    );
};
