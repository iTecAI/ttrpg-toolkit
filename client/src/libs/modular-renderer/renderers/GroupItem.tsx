import { RendererFunction } from ".";
import RenderItem from "../RenderItem";
import { FormData } from "../types";
import { RenderGroupItem } from "../types/renderTypes";

export const GroupItem: RendererFunction = (
    renderer: RenderGroupItem,
    data: any,
    formData: FormData
) => {
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
