import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { RenderGroupItem } from "../types/renderTypes";

export const GroupItem: RendererFunction<RenderGroupItem> = (
    props: RendererFunctionProps<RenderGroupItem>
) => {
    const { renderer, data, formData } = props;
    const children = renderer.children ?? [];
    return (
        <div className="render-item child group">
            <RenderItem
                renderer={children}
                dataOverride={data}
                formDataOverride={formData}
            />
        </div>
    );
};
