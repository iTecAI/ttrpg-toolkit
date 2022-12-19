import Masonry from "@mui/lab/Masonry";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { FormData } from "../types";
import { RenderMasonryItem } from "../types/renderTypes";

export const MasonryItem: RendererFunction<RenderMasonryItem> = (
    props: RendererFunctionProps<RenderMasonryItem>
) => {
    const { renderer, data, formData } = props;
    const children = renderer.children ?? [];
    return (
        <Masonry
            spacing={renderer.spacing ?? 2}
            columns={renderer.columns ?? 2}
            className="render-item child masonry"
        >
            <RenderItem
                renderer={children}
                dataOverride={data}
                formDataOverride={formData}
            />
        </Masonry>
    );
};
