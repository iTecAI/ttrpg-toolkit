import { Divider } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { RenderDividerItem } from "../types/renderTypes";

export const DividerItem: RendererFunction<RenderDividerItem> = (
    props: RendererFunctionProps<RenderDividerItem>
) => {
    const { renderer, data, formData } = props;
    const child = renderer.child ?? null;
    return (
        <Divider
            className="render-item child divider"
            variant={
                {
                    full: "fullWidth",
                    inset: "inset",
                    middle: "middle",
                }[renderer.variant ?? "middle"] as any
            }
        >
            {child && (
                <RenderItem
                    renderer={child}
                    dataOverride={data}
                    formDataOverride={formData}
                />
            )}
        </Divider>
    );
};
